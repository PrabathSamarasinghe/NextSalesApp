import RecievedInvoice from "@/lib/models/RecievedInvoice.model";
import Product from "@/lib/models/Product.model";
import connectDB from "@/lib/db";

export const getRecievedInvoices = async () => {
    try {
      await connectDB();
        const invoices = await RecievedInvoice.find({}).sort({ createdAt: -1 });
        return invoices;
    } catch (error) {
        console.error("Error fetching recieved invoices:", error);
        throw new Error("Failed to fetch recieved invoices");
    }
}

export const getRecievedInvoiceById = async (id) => {
    try {
      await connectDB();
        const invoice = await RecievedInvoice.findById(id);
        return invoice;
    } catch (error) {
        console.error("Error fetching recieved invoice by ID:", error);
        throw new Error("Failed to fetch recieved invoice by ID");
    }
}

export const createRecievedInvoice = async (invoiceData) => {
  try {
      await connectDB();
      
      // Process each item and update product stock
      await Promise.all(invoiceData.items.map(async item => {
          // First, find the product to get current stock
          const product = await Product.findById(item.product);
          if (!product) {
              throw new Error(`Product with ID ${item.product} not found`);
          }
          
          // Calculate new stock values
          const newEntireStock = (product.entireStock===0 ? product.stock : product.entireStock) + item.quantity;
          const newStock = (product.stock || 0) + item.quantity;
          
          // Update the product with new stock values
          await Product.findByIdAndUpdate(item.product, {
              $set: { 
                  entireStock: newEntireStock,
                  stock: newStock,
              },
          });
      }));
      
      // Create and save the new invoice
      const newInvoice = new RecievedInvoice(invoiceData);
      await newInvoice.save();
      return newInvoice;
  } catch (error) {
      console.error("Error creating received invoice:", error);
      throw new Error(`Failed to create received invoice: ${error.message}`);
  }
}

export const getNextInvoiceNumber = async () => {
  try {
    await connectDB();

    const lastInvoice = await RecievedInvoice.findOne({
      invoiceNumber: new RegExp(`REC-`),
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!lastInvoice) {
      return `REC-2899`; // First invoice of the year
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
    const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
    return `REC-${nextNumber}`;
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};