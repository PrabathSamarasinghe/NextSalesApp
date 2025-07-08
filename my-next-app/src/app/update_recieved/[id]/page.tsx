"use client";
import { JSX, useState, useEffect } from "react";
import { Save, Plus, Trash2, ArrowLeft, Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import LoadingPage from "@/components/loadingPage";

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
  _id?: string;
  invoiceNumber: string;
  date: string;
  supplier: string;
  items: InvoiceItem[];
  total: number;
  notes: string;
}

interface NewProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function ReceivedInvoiceEntry(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditing = Boolean(id && id !== 'new');

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers] = useState<{ _id: string; name: string }[]>([
    { _id: "1", name: "Devagiri Tea Factory" },
    { _id: "2", name: "KAIRO Trading" },
  ]);

  const [showNewProductModal, setShowNewProductModal] = useState<boolean>(false);
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
    supplier: suppliers[0]?.name || "",
    items: [{ id: 1, name: "", product: "", quantity: 1, price: 0, total: 0 }],
    total: 0,
    notes: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/product/all");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // If editing an existing invoice, fetch its data
        if (isEditing) {
          const invoiceResponse = await fetch(`/api/recievedInv/view`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });
          
          if (!invoiceResponse.ok) {
            throw new Error(`Failed to fetch invoice: ${invoiceResponse.status}`);
          }
          
          const invoiceData = await invoiceResponse.json();
          
          // Map the API data to our state structure
          const mappedData: ReceivedInvoiceData = {
            _id: invoiceData._id,
            invoiceNumber: invoiceData.invoiceNumber || "",
            date: invoiceData.date ? invoiceData.date.split('T')[0] : new Date().toISOString().split("T")[0],
            supplier: invoiceData.supplier || "",
            items: invoiceData.items && invoiceData.items.length > 0 
              ? invoiceData.items.map((item: any, index: number) => ({
                  id: index + 1,
                  name: item.product?.name || item.name || "",
                  product: item.product?._id || item.product || "",
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                  total: (item.quantity || 1) * (item.price || 0),
                }))
              : [{ id: 1, name: "", product: "", quantity: 1, price: 0, total: 0 }],
            total: invoiceData.total || 0,
            notes: invoiceData.notes || "",
          };
          
          setReceivedInvoice(mappedData);
        } else {
          // For new invoice, fetch next invoice number
          try {
            const invoiceNumResponse = await fetch("/api/recievedInv/nextNum");
            if (invoiceNumResponse.ok) {
              const invoiceNumData = await invoiceNumResponse.json();
              setReceivedInvoice(prev => ({
                ...prev,
                invoiceNumber: invoiceNumData,
              }));
            }
          } catch (error) {
            console.error("Error fetching next invoice number:", error);
            // Continue without setting invoice number
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        alert(`Failed to load initial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditing]);

  const updateItemField = (
    itemId: number,
    field: keyof InvoiceItem,
    value: string | number
  ): void => {
    setReceivedInvoice(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          if (field === "product") {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
              updatedItem.price = selectedProduct.price;
              updatedItem.name = selectedProduct.name;
            }
          }

          updatedItem.total = updatedItem.quantity * updatedItem.price;
          return updatedItem;
        }
        return item;
      });

      const total = updatedItems.reduce((sum, item) => sum + item.total, 0);

      return {
        ...prev,
        items: updatedItems,
        total,
      };
    });
  };

  const addItem = (): void => {
    setReceivedInvoice(prev => {
      const newId = prev.items.length > 0 
        ? Math.max(...prev.items.map(item => item.id)) + 1 
        : 1;
      
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: newId,
            name: "",
            product: "",
            quantity: 1,
            price: 0,
            total: 0,
          }
        ]
      };
    });
  };

  const removeItem = (itemId: number): void => {
    if (receivedInvoice.items.length > 1) {
      setReceivedInvoice(prev => {
        const filteredItems = prev.items.filter(item => item.id !== itemId);
        const total = filteredItems.reduce((sum, item) => sum + item.total, 0);
        
        return {
          ...prev,
          items: filteredItems,
          total,
        };
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleSupplierSelection = (supplierName: string) => {
    setReceivedInvoice(prev => ({
      ...prev,
      supplier: supplierName,
    }));
  };

  const handleSaveReceivedInvoice = async () => {
    // Validation
    if (!receivedInvoice.invoiceNumber.trim()) {
      alert("Please enter an invoice number");
      return;
    }

    if (!receivedInvoice.supplier) {
      alert("Please select a supplier");
      return;
    }

    if (receivedInvoice.items.some(item => !item.product)) {
      alert("Please select products for all invoice items");
      return;
    }

    if (receivedInvoice.items.length === 0) {
      alert("Please add at least one item to the invoice");
      return;
    }

    if (receivedInvoice.items.some(item => item.quantity <= 0)) {
      alert("All items must have a quantity greater than 0");
      return;
    }

    if (receivedInvoice.items.some(item => item.price < 0)) {
      alert("All items must have a valid price");
      return;
    }

    setSaving(true);

    try {
      const requestBody = {
        ...receivedInvoice,
        items: receivedInvoice.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          name: item.name
        }))
      };

      let response;
      if (isEditing) {
        // Update existing invoice
        response = await fetch(`/api/recievedInv/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId: id,
            invoiceData: requestBody,
          }),
        });
      } else {
        // Create new invoice
        response = await fetch(`/api/recievedInv/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      alert(isEditing ? "Invoice updated successfully!" : "Invoice created successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`Failed to ${isEditing ? "update" : "create"} invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewProduct = async () => {
    if (!newProduct.name.trim()) {
      setProductError("Product name is required");
      return;
    }
    if (!newProduct.category.trim()) {
      setProductError("Category is required");
      return;
    }
    if (newProduct.price <= 0) {
      setProductError("Price must be greater than 0");
      return;
    }
    if (newProduct.stock < 0) {
      setProductError("Stock cannot be negative");
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
        const errorText = await response.text();
        throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
      }

      const createdProduct = await response.json();
      setProducts(prev => [...prev, createdProduct]);

      setShowNewProductModal(false);
      setNewProduct({
        name: "",
        category: "",
        price: 0,
        stock: 0,
      });

      alert("Product added successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      setProductError(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              {isEditing ? "Update Received Invoice" : "Create Received Invoice"}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number*
                </label>
                <input
                  type="text"
                  value={receivedInvoice.invoiceNumber}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) =>
                    setReceivedInvoice({
                      ...receivedInvoice,
                      invoiceNumber: e.target.value,
                    })
                  }
                  placeholder="Enter invoice number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date*
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
                  Supplier*
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={receivedInvoice.supplier}
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

              <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                                updateItemField(
                                  item.id,
                                  "product",
                                  e.target.value
                                );
                              }}
                            >
                              <option value="">Select a product</option>
                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
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
                              value={formatCurrency(item.total)}
                              readOnly
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                              aria-label="Remove item"
                              disabled={receivedInvoice.items.length === 1}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
                          disabled={receivedInvoice.items.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <select
                        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.product}
                        onChange={(e) => {
                          updateItemField(
                            item.id,
                            "product",
                            e.target.value
                          );
                        }}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
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
                          value={formatCurrency(item.total)}
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
                    className="                    w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={receivedInvoice.notes}
                    onChange={(e) =>
                      setReceivedInvoice({
                        ...receivedInvoice,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(receivedInvoice.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax (0%):</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(receivedInvoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReceivedInvoice}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors duration-200"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {isEditing ? "Update Invoice" : "Create Invoice"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}