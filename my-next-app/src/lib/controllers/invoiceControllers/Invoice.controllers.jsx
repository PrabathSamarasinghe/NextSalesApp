import Invoice from "@/lib/models/Invoice.model";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product.model";

export const createInvoice = async (invoiceData) => {
  try {
    await connectDB();
    await Promise.all(
      invoiceData.items.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      })
    );
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    return { status: 201, message: "Invoice created successfully" };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getAllInvoices = async () => {
  try {
    await connectDB();
    const invoices = await Invoice.find({}).sort({ date: -1 }).exec();
    return { status: 200, invoices };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    await connectDB();
    const result = await Invoice.updateOne(
      { _id: invoiceId },
      { isCancelled: true }
    );
    if (result.modifiedCount === 0) {
      return { status: 404, message: "Invoice not found" };
    }
    return { status: 200, message: "Invoice cancelled successfully" };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getInvoicesOfCustomer = async (customerId) => {
  try {
    await connectDB();
    // Get all invoices for this customer
    const invoices = await Invoice.find({ customer: customerId }).lean().exec();
    
    // Process each invoice to add categories to items
    const processedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        // Process items for each invoice
        const processedItems = await Promise.all(
          invoice.items.map(async (item) => {
            const product = await Product.findById(item.product).lean();
            if (!product) {
              return item; // Handle case where product might not exist
            }
            
            // Create a new object with item properties and category
            return {
              ...item,
              category: product.category
            };
          })
        );
        
        // Return the invoice with processed items
        return {
          ...invoice,
          items: processedItems
        };
      })
    );
    
    return { status: 200, invoices: processedInvoices };
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getAdditionalData = async (customerId) => {
  try {
    await connectDB();
    const invoices = await Invoice.find({ customer: customerId });
    if (!invoices || invoices.length === 0) {
      return { totalSpent: 0, lastPurchaseDate: null };
    }
    const totalSpent = invoices.reduce(
      (total, invoice) => total + invoice.total,
      0
    );
    const lastPurchaseDate = invoices.sort((a, b) => b.date - a.date)[0].date;
    return { totalSpent, lastPurchaseDate };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const advancePayment = async (invoiceId, paymentData) => {
  try {
    await connectDB();
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    invoice.advance += paymentData;
    if (invoice.advance >= invoice.total) {
      invoice.isPaid = true;
    }
    await invoice.save();
    return { message: "Payment applied successfully" };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const markAsPaid = async (id) => {
  try {
    await connectDB();
    const result = await Invoice.updateOne({ _id: id }, { isPaid: true });
    if (result.modifiedCount === 0) {
      throw new Error("Invoice not found or already marked as paid");
    }
    return { message: "Invoice marked as paid successfully" };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getNextInvoiceNumber = async () => {
  try {
    await connectDB();

    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`INV-`),
    })
      .sort({ date: -1 })
      .limit(1);

    if (!lastInvoice) {
      return `INV-25201`; // First invoice of the year
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
    const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
    return `INV-${nextNumber}`;
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getRecentInvoices = async () => {
  try {
    await connectDB();
    const invoices = await Invoice.find().sort({ date: -1 }).limit(5);
    return invoices;
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getTopSellingProducts = async () => {
  try {
    await connectDB();
    const invoices = await Invoice.aggregate([
      // Only include non-cancelled invoices
      {
        $match: {
          isCancelled: false,
        },
      },
      // Unwind items array to process each item separately
      {
        $unwind: "$items",
      },
      // Look up product details to get the category
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      // Add a field for the product category
      {
        $addFields: {
          productCategory: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },
      // Group by product ID
      {
        $group: {
          _id: "$items.product",
          totalQuantity: {
            $sum: {
              $divide: [
                {
                  $cond: [
                    // Case 1: bulk → 1000g
                    {
                      $or: [
                        { $eq: [{ $toLower: "$productCategory" }, "bulk"] },
                        { $eq: [{ $toLower: "$productCategory" }, "550g/l"] },
                      ],
                    },
                    { $multiply: ["$items.quantity", 1000] },

                    // Case 2: sample Xg (e.g., "sample 20g")
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: "$productCategory",
                            regex: /^sample \d+g$/i,
                          },
                        },
                        {
                          $multiply: [
                            "$items.quantity",
                            {
                              $toInt: {
                                $replaceAll: {
                                  input: {
                                    $arrayElemAt: [
                                      { $split: ["$productCategory", " "] },
                                      1,
                                    ],
                                  },
                                  find: "g",
                                  replacement: "",
                                },
                              },
                            },
                          ],
                        },

                        // Case 3: Xg (e.g., "250g")
                        {
                          $cond: [
                            {
                              $regexMatch: {
                                input: "$productCategory",
                                regex: /^\d+g$/i,
                              },
                            },
                            {
                              $multiply: [
                                "$items.quantity",
                                {
                                  $toInt: {
                                    $replaceAll: {
                                      input: "$productCategory",
                                      find: "g",
                                      replacement: "",
                                    },
                                  },
                                },
                              ],
                            },

                            // Case 4: sample (no weight) → assume 1000g
                            {
                              $cond: [
                                {
                                  $eq: [
                                    { $toLower: "$productCategory" },
                                    "sample",
                                  ],
                                },
                                { $multiply: ["$items.quantity", 1000] },

                                // Case 5: tea bag → 2g
                                {
                                  $cond: [
                                    {
                                      $eq: [
                                        { $toLower: "$productCategory" },
                                        "tea bag",
                                      ],
                                    },
                                    { $multiply: ["$items.quantity", 2] },

                                    // Default
                                    "$items.quantity",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                1000, // convert g to kg
              ],
            },
          },
          totalRevenue: { $sum: "$items.total" },
          productName: { $first: "$items.name" },
        },
      },
      // Add product details for final output
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      // Format the output
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          category: { $arrayElemAt: ["$productInfo.category", 0] },
          totalQuantity: {
            $cond: [
              {
                $or: [
                  {
                    $eq: [
                      {
                        $toLower: {
                          $arrayElemAt: ["$productInfo.category", 0],
                        },
                      },
                      "bulk",
                    ],
                  },
                  {
                    $eq: [
                      {
                        $toLower: {
                          $arrayElemAt: ["$productInfo.category", 0],
                        },
                      },
                      "tea bag",
                    ],
                  },
                ],
              },
              "$totalQuantity", // Keep original if bulk or tea bag
              { $divide: ["$totalQuantity", 1] }, // Convert to kg otherwise
            ],
          },
          totalRevenue: 1,
        },
      },
      // Sort by total quantity sold in descending order
      {
        $sort: { totalQuantity: -1 },
      },
    ]);
    return invoices;
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const getInvoiceById = async (id) => {
  try {
    await connectDB();
    // Use lean() for better performance when you just need the data
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    // Map over items array and add category
    invoice.items = await Promise.all(
      invoice.items.map(async (item) => {
        const product = await Product.findById(item.product).lean();
        if (!product) {
          return item; // Handle case where product might not exist
        }
        
        // Create a new object with item properties and category
        return {
          ...item,
          category: product.category
        };
      })
    );
    
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return {
      status: 500,
      message: error.message,
    };
  }
};
export const getProductSalesReport = async (req, res) => {
  try {
    await connectDB();
    // Parse time frame or date range from request
    const { timeFrame, startDate, endDate } = req.query;

    let dateFilter = {};
    const today = new Date();

    // Set date range based on timeFrame parameter
    if (timeFrame) {
      const todayStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      switch (timeFrame) {
        case "today":
          dateFilter = { $gte: todayStr, $lte: todayStr };
          break;

        case "thisWeek": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

          dateFilter = {
            $gte: startOfWeek.toISOString().split("T")[0],
            $lte: endOfWeek.toISOString().split("T")[0],
          };
          break;
        }

        case "thisMonth": {
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );

          dateFilter = {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          };
          break;
        }

        case "thisYear": {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          const endOfYear = new Date(today.getFullYear(), 11, 31);

          dateFilter = {
            $gte: startOfYear.toISOString().split("T")[0],
            $lte: endOfYear.toISOString().split("T")[0],
          };
          break;
        }

        default:
          // Default to this month if invalid timeFrame
          const defaultStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const defaultEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );

          dateFilter = {
            $gte: defaultStart.toISOString().split("T")[0],
            $lte: defaultEnd.toISOString().split("T")[0],
          };
      }
    } else if (startDate && endDate) {
      // Use custom date range if provided
      dateFilter = { $gte: startDate, $lte: endDate };
    } else {
      // Default to this month if no parameters provided
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      dateFilter = {
        $gte: defaultStart.toISOString().split("T")[0],
        $lte: defaultEnd.toISOString().split("T")[0],
      };
    }

    // Run the aggregation pipeline
    const productSalesData = await Invoice.aggregate([
      // Match invoices within date range and not cancelled
      {
        $match: {
          date: dateFilter,
          isCancelled: false,
        },
      },
      // Unwind the items array
      { $unwind: "$items" },

      // Lookup product details to get the category
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // Add a field for the product category
      {
        $addFields: {
          productCategory: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },

      // Group by product ID
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          totalQuantity: {
            $sum: {
              $divide: [
                {
                  $cond: [
                    // Case 1: bulk or 550g/l → 1000g per unit
                    {
                      $or: [
                        { $eq: [{ $toLower: "$productCategory" }, "bulk"] },
                        { $eq: [{ $toLower: "$productCategory" }, "550g/l"] },
                      ],
                    },
                    { $multiply: ["$items.quantity", 1000] },

                    // Case 2: sample Xg (e.g., "sample 20g")
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: "$productCategory",
                            regex: /^sample \d+g$/i,
                          },
                        },
                        {
                          $multiply: [
                            "$items.quantity",
                            {
                              $toInt: {
                                $replaceAll: {
                                  input: {
                                    $arrayElemAt: [
                                      { $split: ["$productCategory", " "] },
                                      1,
                                    ],
                                  },
                                  find: "g",
                                  replacement: "",
                                },
                              },
                            },
                          ],
                        },

                        // Case 3: Xg (e.g., "250g")
                        {
                          $cond: [
                            {
                              $regexMatch: {
                                input: "$productCategory",
                                regex: /^\d+g$/i,
                              },
                            },
                            {
                              $multiply: [
                                "$items.quantity",
                                {
                                  $toInt: {
                                    $replaceAll: {
                                      input: "$productCategory",
                                      find: "g",
                                      replacement: "",
                                    },
                                  },
                                },
                              ],
                            },

                            // Case 4: sample → assume 1000g
                            {
                              $cond: [
                                {
                                  $eq: [
                                    { $toLower: "$productCategory" },
                                    "sample",
                                  ],
                                },
                                { $multiply: ["$items.quantity", 1000] },

                                // ✅ Case 5: tea bag → assume 2g per unit
                                {
                                  $cond: [
                                    {
                                      $eq: [
                                        { $toLower: "$productCategory" },
                                        "tea bag",
                                      ],
                                    },
                                    { $multiply: ["$items.quantity", 2] },

                                    // Default: use raw quantity
                                    "$items.quantity",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                1000, // Convert grams to kilograms
              ],
            },
          },
          totalRevenue: { $sum: "$items.total" },
          totalInvoices: { $addToSet: "$_id" }, // Collect unique invoice IDs
          category: { $first: "$productCategory" }, // Save category for projection
        },
      },

      // Format the output
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          category: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          totalInvoices: { $size: "$totalInvoices" }, // Count unique invoices
        },
      },

      // Sort by revenue in descending order
      { $sort: { totalRevenue: -1 } },
    ]);

    // Calculate overall totals for summary stats
    const totalStats = productSalesData.reduce(
      (acc, item) => {
        acc.totalRevenue += item.totalRevenue;
        acc.totalQuantity += item.totalQuantity; // Now in kilograms
        acc.totalInvoices += item.totalInvoices;
        return acc;
      },
      { totalRevenue: 0, totalQuantity: 0, totalInvoices: 0 }
    );

    return res.status(200).json({
      success: true,
      data: productSalesData,
      summary: totalStats,
      dateRange: {
        startDate: dateFilter.$gte,
        endDate: dateFilter.$lte,
      },
      unit: "kg", // Add this to indicate that quantities are in kilograms
    });
  } catch (error) {
    console.error("Error generating product sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate product sales report",
      error: error.message,
    });
  }
};

export const customerSummary = async (customerId) => {
  try {
    await connectDB();

    // Find all non-cancelled invoices for this customer
    const invoices = await Invoice.find({
      customer: customerId,
      isCancelled: false,
    }).populate("items.product");

    // Initialize an object to store product summary
    const productSummaryMap = {};

    // Process all invoices and their items
    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const productId = item.product._id.toString();

        // If the product is already in our map, update quantities and totals
        if (productSummaryMap[productId]) {
          productSummaryMap[productId].quantity += item.quantity;
          productSummaryMap[productId].totalSpent += item.total;
        }
        // Otherwise, create a new entry for this product
        else {
          productSummaryMap[productId] = {
            productId: productId,
            productName: item.name,
            quantity: item.quantity,
            totalSpent: item.total,
            // If you have product category in your model, you can include it here
            category: item.product.category || "N/A",
            averagePrice: item.price,
          };
        }
      });
    });

    // Convert the map to an array
    const productSummary = Object.values(productSummaryMap);

    // Calculate additional metrics for each product
    productSummary.forEach((product) => {
      product.averagePrice = product.totalSpent / product.quantity;
    });

    // Calculate overall totals
    const totalInvoices = invoices.length;
    const totalSpent = invoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    );
    const totalItemsPurchased = productSummary.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Get the latest purchase date
    const latestInvoice =
      invoices.length > 0
        ? invoices.reduce((latest, invoice) => {
            return new Date(invoice.date) > new Date(latest.date)
              ? invoice
              : latest;
          }, invoices[0])
        : null;

    const latestPurchaseDate = latestInvoice ? latestInvoice.date : null;

    return {
      status: 200,
      data: {
        customerStats: {
          totalInvoices,
          totalSpent,
          totalItemsPurchased,
          latestPurchaseDate,
        },
        productSummary: productSummary.sort((a, b) => b.quantity - a.quantity), // Sort by quantity in descending order
      },
    };
  } catch (error) {
    console.error("Error in customerSummary:", error);
    return {
      status: 500,
      message: error.message,
    };
  }
};
