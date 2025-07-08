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
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    await connectDB();
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return { status: 404, message: "Invoice not found" };
    }
    Object.assign(invoice, invoiceData);
    await invoice.save();
    return { status: 200, message: "Invoice updated successfully" };
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
    const invoice = await Invoice.findById(invoiceId);

    await Promise.all(
      invoice.items.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
        const result = await Invoice.findByIdAndDelete(invoiceId);
        if (!result) {
          return { status: 404, message: "Invoice not found" };
        }
        return { status: 200, message: "Invoice deleted successfully" };
      })
    );
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

export const cancelInvoice = async (invoiceId) => {
  try {
    await connectDB();
    const invoice = await Invoice.findById(invoiceId);

    await Promise.all(
      invoice.items.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
        const result = await Invoice.updateOne(
          { _id: invoiceId },
          { isCancelled: true }
        );
        if (result.modifiedCount === 0) {
          return { status: 404, message: "Invoice not found" };
        }
      })
    );

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
              category: product.category,
            };
          })
        );

        // Return the invoice with processed items
        return {
          ...invoice,
          items: processedItems,
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

export const getActiveMonthsData = async ({
  timeFrame,
  startDate,
  endDate,
  productName = "Dust 2",
}) => {
  try {
    await connectDB();
    let dateFilter = {};

    // Handle time frame filters
    if (timeFrame) {
      const today = new Date();
      switch (timeFrame) {
        case "today":
          dateFilter = {
            date: {
              $gte: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
              $lte: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
            },
          };
          break;
        case "thisWeek":
          const startOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay())
          );
          const endOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay() + 6)
          );
          dateFilter = {
            date: {
              $gte: startOfWeek.toISOString(),
              $lte: endOfWeek.toISOString(),
            },
          };
          break;
        case "thisMonth":
          dateFilter = {
            date: {
              $gte: new Date(
                today.getFullYear(),
                today.getMonth(),
                1
              ).toISOString(),
              $lte: new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
              ).toISOString(),
            },
          };
          break;
        case "thisYear":
          dateFilter = {
            date: {
              $gte: new Date(today.getFullYear(), 0, 1).toISOString(),
              $lte: new Date(today.getFullYear(), 11, 31).toISOString(),
            },
          };
          break;
        default:
          break;
      }
    } else if (startDate && endDate) {
      // Handle custom date range
      dateFilter = {
        date: {
          $gte: new Date(startDate).toISOString(),
          $lte: new Date(endDate).toISOString(),
        },
      };
    }

    // Build the match conditions
    const matchConditions = { ...dateFilter };

    // Add product name filter if provided
    if (productName) {
      matchConditions["items.name"] = productName;
    }

    // Get distinct months with invoices
    const activeMonths = await Invoice.aggregate([
      { $match: matchConditions },
      {
        $project: {
          // Convert string date to proper date object
          convertedDate: {
            $dateFromString: {
              dateString: "$date",
              format: "%Y-%m-%d", // Adjust format if your date strings are different
            },
          },
          // Include items for filtering if productName was provided
          ...(productName && { items: 1 }),
        },
      },
      // Only include documents that have the product if productName was provided
      ...(productName
        ? [
            {
              $match: {
                "items.name": productName,
              },
            },
          ]
        : []),
      {
        $group: {
          _id: {
            year: { $year: "$convertedDate" },
            month: { $month: "$convertedDate" },
          },
          // We just need to count 1 document per month
          count: { $sum: 1 },
        },
      },
      {
        $count: "activeMonths",
      },
    ]);

    return {
      success: true,
      activeMonths: activeMonths[0]?.activeMonths || 0,
      ...(productName && { productName }), // Include product name in response if filtered
    };
  } catch (error) {
    console.error("Error fetching active months:", error);
    throw error;
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
      {
        $match: { isCancelled: false },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          productCategory: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: {
            $sum: {
              $divide: [
                {
                  $cond: [
                    // If category has a number (e.g., "250g", "sample 10g")
                    {
                      $regexMatch: {
                        input: "$productCategory",
                        regex: /\d+/,
                      },
                    },
                    {
                      $multiply: [
                        "$items.quantity",
                        {
                          $toInt: {
                            $getField: {
                              field: "match",
                              input: {
                                $arrayElemAt: [
                                  {
                                    $regexFindAll: {
                                      input: "$productCategory",
                                      regex: /\d+/,
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    // Else handle known text-based categories
                    {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: [
                                { $toLower: "$productCategory" },
                                "bulk",
                              ],
                            },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: {
                              $eq: [
                                { $toLower: "$productCategory" },
                                "550g/l",
                              ],
                            },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: {
                              $eq: [
                                { $toLower: "$productCategory" },
                                "sample",
                              ],
                            },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: {
                              $eq: [
                                { $toLower: "$productCategory" },
                                "tea bag",
                              ],
                            },
                            then: { $multiply: ["$items.quantity", 2] },
                          },
                        ],
                        default: "$items.quantity",
                      },
                    },
                  ],
                },
                1000, // convert grams to kilograms
              ],
            },
          },
          totalRevenue: { $sum: "$items.total" },
          productName: { $first: "$items.name" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
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
              "$totalQuantity", // leave as is
              { $divide: ["$totalQuantity", 1] }, // (no-op, for structure)
            ],
          },
          totalRevenue: 1,
        },
      },
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
          category: product.category,
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
// getProductSalesReport.js
export const getProductSalesReport = async (req, res) => {
  try {
    await connectDB();
    const { timeFrame, startDate, endDate } = req.query;
    const today = new Date();
    let dateFilter = {};

    if (timeFrame) {
      switch (timeFrame) {
        case "today": {
          const day = today.toISOString().split("T")[0];
          dateFilter = { $gte: day, $lte: day };
          break;
        }
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
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          dateFilter = {
            $gte: start.toISOString().split("T")[0],
            $lte: end.toISOString().split("T")[0],
          };
          break;
        }
        case "thisYear": {
          const start = new Date(today.getFullYear(), 0, 1);
          const end = new Date(today.getFullYear(), 11, 31);
          dateFilter = {
            $gte: start.toISOString().split("T")[0],
            $lte: end.toISOString().split("T")[0],
          };
          break;
        }
        default: {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          dateFilter = {
            $gte: start.toISOString().split("T")[0],
            $lte: end.toISOString().split("T")[0],
          };
        }
      }
    } else if (startDate && endDate) {
      dateFilter = { $gte: startDate, $lte: endDate };
    } else {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateFilter = {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      };
    }

    const productSalesData = await Invoice.aggregate([
      { $match: { isCancelled: false, date: dateFilter } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          productCategory: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          category: { $first: "$productCategory" },
          totalRevenue: { $sum: "$items.total" },
          totalInvoices: { $addToSet: "$_id" },
          totalQuantity: {
            $sum: {
              $divide: [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$productCategory",
                        regex: /\d+/, // If category contains a number
                      },
                    },
                    {
                      $multiply: [
                        "$items.quantity",
                        {
                          $toInt: {
                            $getField: {
                              field: "match",
                              input: {
                                $arrayElemAt: [
                                  {
                                    $regexFindAll: {
                                      input: "$productCategory",
                                      regex: /\d+/,
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: [{ $toLower: "$productCategory" }, "bulk"] },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: { $eq: [{ $toLower: "$productCategory" }, "550g/l"] },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: { $eq: [{ $toLower: "$productCategory" }, "sample"] },
                            then: { $multiply: ["$items.quantity", 1000] },
                          },
                          {
                            case: { $eq: [{ $toLower: "$productCategory" }, "tea bag"] },
                            then: { $multiply: ["$items.quantity", 2] },
                          },
                        ],
                        default: "$items.quantity",
                      },
                    },
                  ],
                },
                1000,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          category: 1,
          totalRevenue: 1,
          totalInvoices: { $size: "$totalInvoices" },
          totalQuantity: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const totalStats = productSalesData.reduce(
      (acc, item) => {
        acc.totalRevenue += item.totalRevenue;
        acc.totalQuantity += item.totalQuantity;
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
      unit: "kg",
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
