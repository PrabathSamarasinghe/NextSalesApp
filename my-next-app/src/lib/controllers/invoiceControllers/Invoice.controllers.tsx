import Invoice from "@/lib/models/Invoice.model";
import connectDB from "@/lib/db";

export const createInvoice = async (invoiceData: any) => {
  try {
    await connectDB();
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    return { status: 201, menubar: "Invoice created successfully" };
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getAllInvoices = async () => {
  try {
    await connectDB();
    const invoices = await Invoice.find({}).exec();
    return { status: 200, invoices };
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const deleteInvoice = async (invoiceId: string) => {
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
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getInvoicesOfCustomer = async (customerId: string) => {
  try {
    await connectDB();
    const invoices = await Invoice.find({ customer: customerId }).exec();
    return { status: 200, invoices };
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getAdditionalData = async (customerId: string) => {
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
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const markAsPaid = async (id: string) => {
  try {
    await connectDB();
    const result = await Invoice.updateOne({ _id: id }, { isPaid: true });
    if (result.modifiedCount === 0) {
      throw new Error("Invoice not found or already marked as paid");
    }
    return { message: "Invoice marked as paid successfully" };
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getNextInvoiceNumber = async () => {
  try {
    await connectDB();
    const currentYear = new Date().getFullYear();

    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`INV-${currentYear}-`),
    })
      .sort({ invoiceNumber: -1 })
      .limit(1);

    if (!lastInvoice) {
      return `INV-${currentYear}-0001`; // First invoice of the year
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
    return `INV-${currentYear}-${nextNumber}`;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getRecentInvoices = async () => {
  try {
    await connectDB();
    const invoices = await Invoice.find().sort({ date: -1 }).limit(5);
    return invoices;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
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
      // Group by product ID
      {
        $group: {
          _id: "$items.product", // This should match your items.product field
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" }, // Using the pre-calculated total
          productName: { $first: "$items.name" }, // Get the product name from items
        },
      },
      // Sort by total quantity sold in descending order
      {
        $sort: { totalQuantity: -1 },
      },
      // Limit to top 5 products
      {
        $limit: 5,
      },
      // Optional: Look up additional product details if needed
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      // Format the output
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          // Include any additional fields from productDetails if needed
          // productDescription: { $arrayElemAt: ['$productDetails.description', 0] }
        },
      },
    ]);
    return invoices;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getInvoiceById = async (id : string) => {
  try {
    await connectDB();
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    return invoice;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};
export const getProductSalesReport = async (req: Request & { query: { timeFrame?: string, startDate?: string, endDate?: string } }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; data?: any[]; summary?: any; dateRange?: { startDate: string | undefined; endDate: string | undefined; }; message?: string; error?: any; }): any; new(): any; }; }; }) => {
  try {
    await connectDB();
    // Parse time frame or date range from request
    const { timeFrame, startDate, endDate } = req.query;

    let dateFilter: { $gte?: string; $lte?: string } = {};
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
          isPaid: true, // Optionally include only paid invoices
        },
      },
      // Unwind the items array
      { $unwind: "$items" },

      // Group by product ID
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" }, // Get product name from invoice items
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          totalInvoices: { $addToSet: "$_id" }, // Collect unique invoice IDs
        },
      },

      // Post-processing to count invoices
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
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
    });
  } catch (error : any) {
    console.error("Error generating product sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate product sales report",
      error: error.message,
    });
  }
};
