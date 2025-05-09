"use client";
import { useState, useLayoutEffect } from "react";
import { Plus, Search, Edit, Trash2, ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import LoadingPage from '@/components/loadingPage';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(); // Replace with actual role fetching logic
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [producttoUpdate, setProductToUpdate] = useState({
    _id: "",
    name: "",
    price: 0,
    category: "",
    stock: 0,
  });
  const [products, setProducts] = useState([
    {
      _id: "",
      name: "",
      price: 0,
      category: "",
      stock: 0,
    },
  ]);

  useLayoutEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch("/api/admin/auth");
        const data = await response.json();
        setRole(data.decoded.role);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchRole();
    fetchProducts();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useRouter();

  const handleUpdateProduct = async (updatedProduct) => {
    const response = await fetch(`/api/product/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: updatedProduct._id, ...updatedProduct }),
    });
    const data = await response.json();
    if (response.ok) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
      setIsUpdateModalOpen(false);
    } else {
      console.error("Error updating product:", data.message);
    }
  };

  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = products.slice(firstPostIndex, lastPostIndex);

  const filteredProducts = searchTerm
    ? currentPosts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentPosts;

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Product Management
        </h1>
        <div className=" grid sm:flex xs:flex-row gap-3 w-full sm:w-auto">
          <button
            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => {
              navigate.push("/received");
            }}
          >
            <FileText size={18} className="mr-2" />
            Received Invoices
          </button>
          {role === "admin" && (
            <button
              className="inline-flex items-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => {
                navigate.push("/received-invoice");
              }}
            >
              <Plus size={18} className="mr-2" />
              Add Products
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={() => navigate.push("/dashboard")}
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entire Stock
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Stock
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Validation (Rs.)
                </th>
                {role === "admin" && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs.{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.entireStock}
                    <span className="text-gray-400 text-xs font-bold">
                      {" "}
                      (
                      {product.category.toLowerCase() === "bulk" ||
                      product.category.toLowerCase() === "550g/l"
                        ? `${product.entireStock} kg`
                        : product.category.toLowerCase() === "tea bag"
                        ? `${((product.entireStock * 2) / 1000).toFixed(2)} kg`
                        : product.category.toLowerCase() === "sample 20g"
                        ? `${((product.entireStock * 20) / 1000).toFixed(2)} kg`
                        : `${(
                            (product.entireStock *
                              Number(product.category.split("g")[0])) /
                            1000
                          ).toFixed(2)} kg`}
                      )
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                    <span className="text-gray-400 text-xs font-bold">
                      {" "}
                      (
                      {product.category.toLowerCase() === "bulk" ||
                      product.category.toLowerCase() === "550g/l"
                        ? `${product.stock} kg`
                        : product.category.toLowerCase() === "tea bag"
                        ? `${((product.stock * 2) / 1000).toFixed(2)} kg`
                        : product.category.toLowerCase() === "sample 20g"
                        ? `${((product.stock * 20) / 1000).toFixed(2)} kg`
                        : `${(
                            (product.stock *
                              Number(product.category.split("g")[0])) /
                            1000
                          ).toFixed(2)} kg`}
                      )
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock > 0
                      ? Number(product.stock * product.price)
                          .toFixed(2)
                          .replace(/\d(?=(\d{3})+\.)/g, "$&,")
                      : "Out of Stock"}
                  </td>
                  {role === "admin" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setIsUpdateModalOpen(true);
                          setProductToUpdate(product);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this product? This action cannot be undone."
                            )
                          ) {
                            await fetch(`/api/product/delete`, {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ id: product._id }),
                            })
                              .then((res) => {
                                if (res.ok) {
                                  setProducts((prevProducts) =>
                                    prevProducts.filter(
                                      (p) => p._id !== product._id
                                    )
                                  );
                                } else {
                                  console.error(
                                    "Error deleting product:",
                                    res.statusText
                                  );
                                }
                              })
                              .catch((error) => {
                                console.error("Error deleting product:", error);
                              });
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No products found matching your search.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {firstPostIndex + 1} to{" "}
            {Math.min(lastPostIndex, products.length)} of {products.length}{" "}
            results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(products.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isUpdateModalOpen && (
        <UpdateProductModal
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={handleUpdateProduct}
          product={producttoUpdate}
        />
      )}
    </div>
  );
}

// function AddProductModal({ onClose, onAdd }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     price: 0,
//     category: "",
//     stock: 0,
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]:
//         name === "price"
//           ? parseFloat(value)
//           : name === "stock"
//           ? parseInt(value, 10)
//           : value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Convert string values to appropriate types
//     const processedData = {
//       ...formData,
//       price: formData.price,
//       stock: formData.stock,
//     };
//     onAdd(processedData);
//   };

//   return (
//     <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             &times;
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Product Name*
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Price (Rs.)*
//               </label>
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 step="0.01"
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Stock Quantity*
//               </label>
//               <input
//                 type="number"
//                 name="stock"
//                 value={formData.stock}
//                 onChange={handleChange}
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Category*
//               </label>
//               <input
//                 type="text"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               Add Product
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

function UpdateProductModal({ onClose, onUpdate, product }) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    category: product.category,
    entireStock: product.entireStock.toString(),
    stock: product.stock.toString(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      _id: product._id,
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    };
    onUpdate(processedData);
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Update Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rs.)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity*
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
