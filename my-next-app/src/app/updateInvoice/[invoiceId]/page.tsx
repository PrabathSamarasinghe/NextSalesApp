"use client";
import { JSX, useState, useLayoutEffect } from "react";
import { Save, Plus, Trash2, ArrowLeft, Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import LoadingPage from "@/components/loadingPage";

// Define TypeScript interfaces
interface CustomerDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  epfNumber?: string;
}

interface InvoiceItem {
  id: number;
  name: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  epfNumber: string;
  customer: string;
  customerDetails: CustomerDetails;
  isPaid: boolean;
  advance: number; // Added advance payment field
  paymentStatus: "paid" | "unpaid" | "advance"; // Added payment status field
  items: InvoiceItem[];
  total: number;
  notes: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}
interface InvoiceId {
  params:{
    invoiceId : string;
  }
}

export default function InvoiceEntry(): JSX.Element {
  const {invoiceId} = useParams() as InvoiceId["params"];
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    setLoading(true);
    const fetchInvoiceData = async() => {
      const response = await fetch(`/api/invoice/getinvoice`, {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      
      // Determine the payment status based on isPaid and advance values
      let paymentStatus: "paid" | "unpaid" | "advance";
      if (data.isPaid) {
        paymentStatus = "paid";
      } else if (data.advance > 0) {
        paymentStatus = "advance";
      } else {
        paymentStatus = "unpaid";
      }
      
      // Set the invoice with the correct payment status
      setInvoice({
        ...data,
        paymentStatus: paymentStatus
      });
    }
    const fetchCustomers = async () => {
      const response = await fetch("/api/customer/all");
      const data = await response.json();
      setCustomers(data);
    };

    const fetchProducts = async () => {
      const response = await fetch("/api/product/all");
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    };
    fetchInvoiceData();
    fetchProducts();
    fetchCustomers();
  }, [invoiceId]);

  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    epfNumber: "",
    customer: "",
    customerDetails: {
      _id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    isPaid: false,
    advance: 0, // Initialize advance payment as 0
    paymentStatus: "unpaid", // Initialize payment status as unpaid
    items: [{ id: 1, name: "", product: "", quantity: 1, price: 0, total: 0 }],
    total: 0,
    notes: "",
  });

  const [customers, setCustomers] = useState<CustomerDetails[]>([
    {
      _id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      epfNumber: "",
    },
  ]);

  const [products, setProducts] = useState<Product[]>([]);

  const updateItemField = (
    id: number,
    _name: string,
    field: keyof InvoiceItem,
    value: string | number
  ): void => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // If the product is being updated, automatically set the price
        if (field === "product") {
          const selectedProduct = products.find((p) => p._id === value);
          if (selectedProduct) {
            updatedItem.price = selectedProduct.price;
            updatedItem.name = selectedProduct.name;
          }
        }

        // Calculate the total for this item
        updatedItem.total = updatedItem.quantity * updatedItem.price;
        return updatedItem;
      }
      return item;
    });

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;

    setInvoice({
      ...invoice,
      items: updatedItems,
      total,
    });
  };

  const addItem = (): void => {
    const newItem: InvoiceItem = {
      id: invoice.items.length + 1,
      name: "",
      product: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const removeItem = (id: number): void => {
    if (invoice.items.length > 1) {
      const filteredItems = invoice.items.filter((item) => item.id !== id);
      const subtotal = filteredItems.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal;

      setInvoice({
        ...invoice,
        items: filteredItems,
        total,
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleCustomerSelection = (customerId: string) => {
    const selectedCustomer = customers.find(
      (customer) => customer._id === customerId
    );

    if (selectedCustomer) {
      setInvoice({
        ...invoice,
        epfNumber: selectedCustomer.epfNumber || "",
        customer: customerId,
        customerDetails: {
          _id: selectedCustomer._id,
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address,
        },
      });
    } else {
      // Reset customer details if no customer is selected
      setInvoice({
        ...invoice,
        customer: "",
        customerDetails: {
          _id: "",
          name: "",
          email: "",
          phone: "",
          address: "",
        },
      });
    }
  };

  
  // Function to handle payment status change
  const handlePaymentStatusChange = (status: "paid" | "unpaid" | "advance") => {
    const isPaid = status === "paid";
    setInvoice({
      ...invoice,
      paymentStatus: status,
      isPaid: isPaid,
      // Reset advance amount if switching to paid or unpaid
      advance: status !== "advance" ? 0 : invoice.advance,
    });
  };

  // Function to handle advance amount change
  const handleAdvanceChange = (amount: string) => {
    const advanceAmount = parseFloat(amount) || 0;
    // Ensure advance amount doesn't exceed total
    const validAdvance = Math.min(advanceAmount, invoice.total);
    setInvoice({
      ...invoice,
      advance: validAdvance,
    });
  };

  // Function to handle saving the invoice
  const handleSaveInvoice = async () => {
    // Validate if a customer is selected
    if (!invoice.customer) {
      alert("Please select a customer");
      return;
    }

    // Validate if all items have products selected
    if (invoice.items.some((item) => !item.product)) {
      alert("Please select products for all invoice items");
      return;
    }
    
    setLoading(true);
    // Prepare invoice data for saving
    const invoiceData = {
      ...invoice,
      // Make sure we send the required fields for the mongoose model
      isPaid: invoice.paymentStatus === "paid",
      advance: invoice.paymentStatus === "advance" ? invoice.advance : 0,
    };

    try {
      const response = await fetch("/api/invoice/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId: invoiceId, invoiceData }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Invoice saved successfully:", data);
      setInvoice({
        invoiceNumber: "",
        date: new Date().toISOString().split("T")[0],
        epfNumber: "",
        customer: "",
        customerDetails: {
          _id: "",
          name: "",
          email: "",
          phone: "",
          address: "",
        },
        isPaid: false,
        advance: 0,
        paymentStatus: "unpaid",
        items: [{ id: 1, name: "", product: "", quantity: 1, price: 0, total: 0 }],
        total: 0,
        notes: "",
      });
      setLoading(false);
      alert("Invoice saved successfully");
      router.push("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };
  if (loading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            onClick={() => router.push("/invoices")}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Invoices</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="text-2xl font-bold text-gray-800">Update Invoice</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) =>
                    setInvoice({ ...invoice, invoiceNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, date: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPF Number
                </label>
                <input
                  type="text"
                  value={invoice.epfNumber}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <div className="flex space-x-4">
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={invoice.customer}
                  onChange={(e) => handleCustomerSelection(e.target.value)}
                >
                  <option value="">Select a customer or enter a new one</option>
                  {customers.map((customer, index) => (
                    <option key={index} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@example.com"
                  value={invoice.customerDetails.email}
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(123) 456-7890"
                  value={invoice.customerDetails.phone}
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, State"
                  value={invoice.customerDetails.address}
                  disabled={true}
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Invoice Items
                </h3>
                <button
                  onClick={addItem}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md flex items-center text-sm hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                >
                  <Plus size={16} className="mr-1" />
                  Add Item
                </button>
              </div>

              {/* Mobile-responsive invoice table component */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                {/* Desktop view - regular table */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={item.product}
                              onChange={(e) => {
                                const selectedProduct = products.find(
                                  (p) => p._id === e.target.value
                                );
                                updateItemField(
                                  item.id,
                                  selectedProduct ? selectedProduct.name : "",
                                  "product",
                                  e.target.value
                                );
                              }}
                            >
                              <option value="">Select a product</option>
                              {products.map(
                                (product, index) =>
                                  product.stock > 0 && (
                                    <option key={index} value={product._id}>
                                      {product.name}{" "}
                                      {product.category
                                        ? `(${product.category})`
                                        : ""}
                                    </option>
                                  )
                              )}
                            </select>
                          </td>
                            <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={item.quantity}
                              onChange={(e) => {
                              const selectedProduct = products.find(
                                (p) => p._id === item.product
                              );
                              const maxStock = selectedProduct?.stock || 1;
                              const value = Math.min(
                                parseFloat(e.target.value) || 0,
                                maxStock
                              );
                              updateItemField(item.id, "", "quantity", value);
                              }}
                              max={
                              products.find((p) => p._id === item.product)
                                ?.stock || 1
                              }
                            />
                            {item.product && (
                              <p
                              className={`text-xs ${
                                (products.find((p) => p._id === item.product)
                                ?.stock ?? 0) > 20
                                ? "text-gray-500"
                                : "text-red-500"
                              }`}
                              >
                              Available:{" "}
                              {products.find((p) => p._id === item.product)
                                ?.stock || 0}
                              </p>
                            )}
                            </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={item.price}
                              onChange={(e) =>
                                updateItemField(
                                  item.id,
                                  "",
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                            {item.product && (
                              <p className="text-xs text-gray-500">
                                Suggested:{" "}
                                {formatCurrency(
                                  products.find((p) => p._id === item.product)
                                    ?.price || 0
                                )}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={
                                isNaN(item.total)
                                  ? formatCurrency(0)
                                  : formatCurrency(item.total)
                              }
                              readOnly
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view - card-style layout */}
                <div className="md:hidden">
                  {invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 border-b border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Product
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <select
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.product}
                        onChange={(e) => {
                          const selectedProduct = products.find(
                            (p) => p._id === e.target.value
                          );
                          updateItemField(
                            item.id,
                            selectedProduct ? selectedProduct.name : "",
                            "product",
                            e.target.value
                          );
                        }}
                      >
                        <option value="">Select a product</option>
                        {products.map(
                          (product, index) =>
                            product.stock > 0 && (
                              <option key={index} value={product._id}>
                                {product.name}{" "}
                                {product.category
                                  ? `(${product.category})`
                                  : ""}
                              </option>
                            )
                        )}
                      </select>

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={item.quantity}
                            onChange={(e) => {
                              const selectedProduct = products.find(
                                (p) => p._id === item.product
                              );
                              const maxStock = selectedProduct?.stock || 1;
                              const value = Math.min(
                                parseInt(e.target.value),
                                maxStock
                              );
                              updateItemField(item.id, "", "quantity", value);
                            }}
                            max={
                              products.find((p) => p._id === item.product)
                                ?.stock || 1
                            }
                          />
                          {item.product && (
                            <p
                              className={`text-xs mt-1 ${
                                (products.find((p) => p._id === item.product)
                                  ?.stock ?? 0) > 20
                                  ? "text-gray-500"
                                  : "text-red-500"
                              }`}
                            >
                              Available:{" "}
                              {products.find((p) => p._id === item.product)
                                ?.stock || 0}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={item.price}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                "",
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          {item.product && (
                            <p className="text-xs mt-1 text-gray-500">
                              Suggested:{" "}
                              {formatCurrency(
                                products.find((p) => p._id === item.product)
                                  ?.price || 0
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={
                            isNaN(item.total)
                              ? formatCurrency(0)
                              : formatCurrency(item.total)
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between mb-8 gap-8">
              <div className="w-full md:w-1/2">
                <fieldset className="border border-gray-200 rounded-lg p-4">
                  <legend className="text-sm font-medium text-gray-700 px-2">
                    Payment Status
                  </legend>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    {/* Paid button */}
                    <button
                      type="button"
                      aria-pressed={invoice.paymentStatus === "paid"}
                      className={`
                        px-4 py-2 rounded-md transition-colors duration-200
                        flex items-center justify-center space-x-2
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full
                        ${
                          invoice.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-500"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                        }
                      `}
                      onClick={() => handlePaymentStatusChange("paid")}
                    >
                      <Check
                        size={18}
                        className={`${
                          invoice.paymentStatus === "paid"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <span>Paid</span>
                    </button>

                    {/* Advance Payment button */}
                    <button
                      type="button"
                      aria-pressed={invoice.paymentStatus === "advance"}
                      className={`
                        px-4 py-2 rounded-md transition-colors duration-200
                        flex items-center justify-center space-x-2
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full
                        ${
                          invoice.paymentStatus === "advance"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-500"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                        }
                      `}
                      onClick={() => handlePaymentStatusChange("advance")}
                    >
                      <Check
                        size={18}
                        className={`${
                          invoice.paymentStatus === "advance"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <span>Advance</span>
                    </button>

                    {/* Unpaid button */}
                    <button
                      type="button"
                      aria-pressed={invoice.paymentStatus === "unpaid"}
                      className={`
                        px-4 py-2 rounded-md transition-colors duration-200
                        flex items-center justify-center space-x-2
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full
                        ${
                          invoice.paymentStatus === "unpaid"
                            ? "bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-500"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                        }
                      `}
                      onClick={() => handlePaymentStatusChange("unpaid")}
                    >
                      <X
                        size={18}
                        className={`${
                          invoice.paymentStatus === "unpaid"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <span>Unpaid</span>
                    </button>
                  </div>

                  {/* Advance payment amount input */}
                  {invoice.paymentStatus === "advance" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={invoice.total}
                          step="0.01"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={invoice.advance || ""}
                          onChange={(e) => handleAdvanceChange(e.target.value)}
                          placeholder="Enter advance amount"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Maximum: {formatCurrency(invoice.total)}
                        </div>
                      </div>
                    </div>
                  )}
                </fieldset>
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Invoice Summary
                  </h3>
                  <div className="flex justify-between py-3 border-t border-gray-300 mt-2">
                    <span className="text-gray-800 font-semibold">Total:</span>
                    <span className="text-gray-800 font-bold text-lg">
                      {isNaN(invoice.total)
                        ? formatCurrency(0)
                        : formatCurrency(invoice.total)}
                    </span>
                  </div>

                  {/* Display advance payment in summary if applicable */}
                  {invoice.paymentStatus === "advance" &&
                    invoice.advance > 0 && (
                      <div className="flex justify-between py-2 text-sm">
                        <span className="text-gray-700">Advance Payment:</span>
                        <span className="text-gray-700">
                          {formatCurrency(invoice.advance)}
                        </span>
                      </div>
                    )}

                  {/* Display remaining balance if advance payment */}
                  {invoice.paymentStatus === "advance" &&
                    invoice.advance > 0 && (
                      <div className="flex justify-between py-2 border-t border-gray-200 text-sm font-medium">
                        <span className="text-gray-700">
                          Remaining Balance:
                        </span>
                        <span className="text-gray-700">
                          {formatCurrency(invoice.total - invoice.advance)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
                value={invoice.notes}
                onChange={(e) =>
                  setInvoice({ ...invoice, notes: e.target.value })
                }
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
              <button
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md flex items-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                onClick={handleSaveInvoice}
              >
                <Save size={18} />
                <span>Update Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
