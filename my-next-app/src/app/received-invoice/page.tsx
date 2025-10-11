"use client";
import { JSX, useState, useLayoutEffect } from "react";
import { Save, Plus, Trash2, ArrowLeft, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/loadingPage";

// Define TypeScript interfaces
interface InvoiceItem {
  id: number;
  name: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

interface ReceivedInvoiceData {
  invoiceNumber: string;
  date: string;
  supplier: string;
  items: InvoiceItem[];
  total: number;
  notes: string;
}

// New product interface
interface NewProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function ReceivedInvoiceEntry(): JSX.Element {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers] = useState<{ _id: string; name: string }[]>([
    { _id: "1", name: "Devagiri Tea Factory" },
    { _id: "2", name: "KAIRO Trading" },
  ]);

  // New product modal state
  const [showNewProductModal, setShowNewProductModal] =
    useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    category: "",
    price: 0,
    stock: 0,
  });
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productError, setProductError] = useState<string>("");

  const [receivedInvoice, setReceivedInvoice] = useState<ReceivedInvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    supplier: suppliers[0]?.name,
    items: [{ id: 1, name: "", product: "", quantity: 1, price: 0, total: 0 }],
    total: 0,
    notes: "",
  });

  useLayoutEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product/all");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchNewInvoiceNumber = async () => {
      try {
        const response = await fetch("/api/recievedInv/nextNum");
        const data = await response.json();
        setReceivedInvoice((prev) => ({
          ...prev,
          invoiceNumber: data,
        }));
      } catch (error) {
        console.error("Error fetching next invoice number:", error);
        // If API doesn't exist yet, generate a placeholder
        setReceivedInvoice((prev) => ({
          ...prev,
          invoiceNumber: `RECV-${Math.floor(Math.random() * 10000)}`,
        }));
      }
    };

    fetchProducts();
    // fetchSuppliers();
    fetchNewInvoiceNumber();
  }, [receivedInvoice.items]);

  const updateItemField = (
    id: number,
    _name: string,
    field: keyof InvoiceItem,
    value: string | number
  ): void => {
    const updatedItems = receivedInvoice.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // If the product is being updated, automatically set the price and name
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

    setReceivedInvoice({
      ...receivedInvoice,
      items: updatedItems,
    });
  };

  const addItem = (): void => {
    const newItem: InvoiceItem = {
      id: receivedInvoice.items.length + 1,
      name: "",
      product: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setReceivedInvoice({
      ...receivedInvoice,
      items: [...receivedInvoice.items, newItem],
    });
  };

  const removeItem = (id: number): void => {
    if (receivedInvoice.items.length > 1) {
      const filteredItems = receivedInvoice.items.filter(
        (item) => item.id !== id
      );
      setReceivedInvoice({
        ...receivedInvoice,
        items: filteredItems,
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleSupplierSelection = (supplierId: string) => {
    setReceivedInvoice({
      ...receivedInvoice,
      supplier: supplierId,
    });
  };

  // Update total whenever items change
  useLayoutEffect(() => {
    const total = receivedInvoice.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    setReceivedInvoice((prev) => ({
      ...prev,
      total: total,
    }));
  }, [receivedInvoice.items]);

  const [loading, setLoading] = useState<boolean>(false);
  // Function to handle saving the received invoice
  const handleSaveReceivedInvoice = async () => {
    // Validate if a supplier is selected
    // if (!receivedInvoice.supplier) {
    //   alert("Please select a supplier");
    //   return;
    // }

    // Validate if all items have products selected
    if (receivedInvoice.items.some((item) => !item.product)) {
      alert("Please select products for all invoice items");
      return;
    }

    // Validate if invoice has items
    if (receivedInvoice.items.length === 0) {
      alert("Please add at least one item to the invoice");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/recievedInv/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receivedInvoice),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Received invoice saved successfully:", data);
      console.log("Received invoice data:", receivedInvoice);
      setLoading(false);
      alert("Received invoice saved successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Error saving received invoice:", error);
      alert("Failed to save received invoice. Please try again.");
    }
  };

  // Function to handle adding a new product
  const handleAddNewProduct = async () => {
    // Validate product fields
    if (!newProduct.name) {
      setProductError("Product name is required");
      return;
    }
    if (!newProduct.category) {
      setProductError("Category is required");
      return;
    }
    if (newProduct.price <= 0) {
      setProductError("Price must be greater than 0");
      return;
    }

    setIsAddingProduct(true);
    setProductError("");

    try {
      const response = await fetch("/api/product/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const createdProduct = await response.json();

      // Add new product to the products list
      setProducts([...products, createdProduct]);

      // Close modal and reset form
      setShowNewProductModal(false);
      setNewProduct({
        name: "",
        category: "",
        price: 0,
        stock: 0,
      });

      // Show success message
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      setProductError("Failed to create product. Please try again.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Add New Product
              </h3>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {productError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {productError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="Enter category"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price*
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={() => setShowNewProductModal(false)}
                disabled={isAddingProduct}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                onClick={handleAddNewProduct}
                disabled={isAddingProduct}
              >
                {isAddingProduct ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Products</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="text-2xl font-bold text-gray-800">
              New Received Invoice
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={receivedInvoice.invoiceNumber}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) =>
                    setReceivedInvoice({
                      ...receivedInvoice,
                      invoiceNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={receivedInvoice.date}
                  onChange={(e) =>
                    setReceivedInvoice({
                      ...receivedInvoice,
                      date: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={receivedInvoice.supplier || suppliers[0]?.name}
                  onChange={(e) => handleSupplierSelection(e.target.value)}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Received Products
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowNewProductModal(true)}
                    className="px-3 py-2 bg-green-50 text-green-600 rounded-md flex items-center text-sm hover:bg-green-100 transition-colors duration-200 border border-green-200"
                  >
                    <Plus size={16} className="mr-1" />
                    New Product
                  </button>
                  <button
                    onClick={addItem}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md flex items-center text-sm hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Mobile-responsive received invoice table component */}
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
                      {receivedInvoice.items.map((item) => (
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
                              {products.map((product, index) => (
                                <option key={index} value={product._id}>
                                  {product.name}{" "}
                                  {product.category
                                    ? `(${product.category})`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={item.quantity}
                              onChange={(e) => {
                                updateItemField(
                                  item.id,
                                  "",
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                );
                              }}
                            />
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
                              <p className="text-xs text-gray-500 mt-1">
                                Suggested price:{" "}
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
                  {receivedInvoice.items.map((item) => (
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
                        {products.map((product, index) => (
                          <option key={index} value={product._id}>
                            {product.name}{" "}
                            {product.category ? `(${product.category})` : ""}
                          </option>
                        ))}
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
                              updateItemField(
                                item.id,
                                "",
                                "quantity",
                                parseInt(e.target.value) || 1
                              );
                            }}
                          />
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional notes about this received invoice..."
                    value={receivedInvoice.notes}
                    onChange={(e) =>
                      setReceivedInvoice({
                        ...receivedInvoice,
                        notes: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-yellow-700 font-medium mb-2">
                    Important
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Products will be added to inventory when saved</li>
                    <li>Check quantities and prices carefully</li>
                    <li>Make sure to select the correct supplier</li>
                    <li>{`You can add new products directly using the "New Product" button`}</li>
                  </ul>
                </div>
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Invoice Summary
                  </h3>
                  <div className="flex justify-between py-3 border-t border-gray-300 mt-2">
                    <span className="text-gray-800 font-semibold">
                      Total Value:
                    </span>
                    <span className="text-gray-800 font-bold text-lg">
                      {formatCurrency(receivedInvoice.total)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">Total Items:</span>
                    <span className="text-gray-700">
                      {receivedInvoice.items.length}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">Total Quantity:</span>
                    <span className="text-gray-700">
                      {receivedInvoice.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
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
                onClick={handleSaveReceivedInvoice}
                // disabled={!receivedInvoice.supplier || receivedInvoice.items.some(item => !item.product)}
              >
                <Save size={18} />
                <span>Save Received Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
