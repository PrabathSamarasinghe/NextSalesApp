"use client";
import { useState, useLayoutEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Mail,
  Plus,
  Phone,
  MapPin,
  Package,
  BarChart3,
  ShoppingCart,
  Trash2,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import UpdateCustomer from "@/components/UpdateCustomer";
import Pagination from "@/components/Pagination";

interface CustomerId {
  params: {
    customer_id: string;
  };
}

interface ProductSummary {
  productId: string;
  productName: string;
  quantity: number;
  totalSpent: number;
  category: string;
  averagePrice: number;
}

interface CustomerStats {
  totalInvoices: number;
  totalSpent: number;
  totalItemsPurchased: number;
  latestPurchaseDate: string;
}

interface CustomerSummary {
  customerStats: CustomerStats;
  productSummary: ProductSummary[];
}

export default function CustomerDetails() {
  const navigate = useRouter();
  const { customer_id } = useParams() as CustomerId["params"];
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    epfNumber: "",
    totalSpent: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [customerSummary, setCustomerSummary] =
    useState<CustomerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customer/getcustomer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: customer_id }),
        });

        if (!response.ok) {
          console.error("Failed to fetch customer data");
          return;
        }

        const data = await response.json();
        setCustomer(data);

        // Fetch total spent
        const totalResponse = await fetch(`/api/invoice/other/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: customer_id }),
        });
        if (totalResponse.ok) {
          const totalData = await totalResponse.json();
          setCustomer((prev) => ({
            ...prev,
            totalSpent: totalData.totalSpent,
          }));
        } else {
          console.error("Failed to fetch total spent");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/invoice/customersInvoices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: customer_id }),
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices);
        } else {
          console.error("Failed to fetch invoices");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    const fetchCustomerSummary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoice/customer-summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: customer_id }),
        });

        if (response.ok) {
          const data = await response.json();
          setCustomerSummary(data.data);
        } else {
          console.error("Failed to fetch customer summary");
        }
      } catch (error) {
        console.error("Error fetching customer summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (customer_id) {
      fetchCustomer();
      fetchInvoices();
      fetchCustomerSummary();
    }
  }, [customer_id]);

  interface InvoiceItem {
    name: string;
    product: string;
    quantity: number;
    price: string;
    total: string;
  }

  interface Invoice {
    isPaid: boolean;
    _id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    total: string;
    status: string;
    items: InvoiceItem[];
  }

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = invoices.slice(firstPostIndex, lastPostIndex);

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <button
            className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-200 font-medium mb-4 sm:mb-0"
            onClick={() => {
              navigate.push("/customers");
            }}
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Back to Customers</span>
          </button>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-5 py-2.5 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
            >
              <Plus size={18} className="mr-2" />
              Update Customer
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to delete this customer?")) {
                  fetch(`/api/customer/delete`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ customerId: customer_id }),
                  })
                    .then((response) => {
                      if (response.ok) {
                        alert("Customer deleted successfully");
                        navigate.push("/customers");
                      } else {
                        alert("Failed to delete customer");
                      }
                    })
                    .catch((error) => {
                      console.error("Error deleting customer:", error);
                    });
                }
              }}
              className="inline-flex items-center px-5 py-2.5 bg-red-700 text-white font-medium rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Customer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {customer.name}
                </h2>
                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">Customer since Jan 2025</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Total Purchase Value
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  Rs.
                  {(customer.totalSpent || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Mail size={18} className="text-blue-700" />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-700">
                    Email
                  </h3>
                </div>
                <p className="mt-3 text-gray-800 font-medium">
                  {customer.email || "Not provided"}
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Phone size={18} className="text-blue-700" />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-700">
                    Phone
                  </h3>
                </div>
                <p className="mt-3 text-gray-800 font-medium">
                  {customer.phone || "Not provided"}
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <MapPin size={18} className="text-blue-700" />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-700">
                    Address
                  </h3>
                </div>
                <p className="mt-3 text-gray-800 font-medium">
                  {customer.address || "Not provided"}
                </p>
              </div>
            </div>

            {/* Customer Product Summary Section */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="flex items-center mb-6">
                <BarChart3 size={20} className="text-blue-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Purchase Analytics
                </h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : customerSummary ? (
                <>
                  {/* Purchase Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-50 rounded-full">
                          <ShoppingCart size={18} className="text-indigo-700" />
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-700">
                          Total Invoices
                        </h3>
                      </div>
                      <p className="mt-3 text-xl font-semibold text-gray-800">
                        {customerSummary.customerStats.totalInvoices}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-50 rounded-full">
                          <Package size={18} className="text-green-700" />
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-700">
                          Items Purchased
                        </h3>
                      </div>
                      <p className="mt-3 text-xl font-semibold text-gray-800">
                        {customerSummary.customerStats.totalItemsPurchased}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <Clock size={18} className="text-blue-700" />
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-700">
                          Latest Purchase
                        </h3>
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-800">
                        {formatDate(
                          customerSummary.customerStats.latestPurchaseDate
                        )}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-50 rounded-full">
                          <BarChart3 size={18} className="text-purple-700" />
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-700">
                          Avg. Purchase Value
                        </h3>
                      </div>
                      <p className="mt-3 text-xl font-semibold text-gray-800">
                        Rs.{" "}
                        {(
                          customerSummary.customerStats.totalSpent /
                          customerSummary.customerStats.totalInvoices
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Product Purchase History */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-800">
                        Products Purchased
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Avg. Price
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Total Spent
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customerSummary.productSummary.map((product) => (
                            <tr
                              key={product.productId}
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                {product.productName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">
                                {product.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">
                                Rs. {product.averagePrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                Rs. {product.totalSpent.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-sm font-semibold text-right bg-gray-50 border-t border-gray-200"
                            >
                              Total:
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-right bg-gray-50 border-t border-gray-200">
                              Rs.{" "}
                              {customerSummary.customerStats.totalSpent.toFixed(
                                2
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {customerSummary.productSummary.length === 0 && (
                      <div className="py-8 text-center text-gray-500">
                        No product purchase history found
                      </div>
                    )}
                  </div>

                  {/* Visual Representation of Purchase History */}
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-700 mb-4">
                      Product Purchase Distribution
                    </h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      {customerSummary.productSummary.map((product) => {
                        const percentage =
                          (product.quantity /
                            customerSummary.customerStats.totalItemsPurchased) *
                          100;
                        return (
                          <div key={product.productId} className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {product.productName} ({product.category})
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                {product.quantity} units (
                                {percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
                  No purchase analytics available
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Purchase History
                </h3>
                {invoices.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {invoices.length}{" "}
                    {invoices.length === 1 ? "invoice" : "invoices"} found
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-center">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPosts.length > 0 ? (
                      currentPosts.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Rs.
                            {(Number(invoice.total) || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.isPaid ? (
                              <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-50 text-green-700 border border-green-200 w-32">
                                Paid
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  await fetch(`/api/invoice/paid`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      invoiceId: invoice._id,
                                    }),
                                  });
                                }}
                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 w-32 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                              >
                                Mark as Paid
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <div className="flex justify-center space-x-4">
                              <button
                                onClick={() =>
                                  setSelectedInvoice(
                                    invoice._id === selectedInvoice
                                      ? null
                                      : invoice._id
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1.5 rounded-full hover:bg-blue-50"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No invoices found for this customer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
                {invoices.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(invoices.length / itemsPerPage)}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}

              {/* Invoice Details Section */}
              {selectedInvoice && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all">
                    {/* Popup Header with Close Button */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200 rounded-t-lg">
                      <h4 className="font-medium text-gray-800">
                        Invoice Details -{" "}
                        <span className="text-blue-700 font-semibold">
                          {
                            invoices.find((inv) => inv._id === selectedInvoice)
                              ?.invoiceNumber
                          }
                        </span>
                      </h4>
                      <button
                        onClick={() => setSelectedInvoice(null)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Popup Content */}
                    <div className="overflow-x-auto bg-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {invoices
                            .find((inv) => inv._id === selectedInvoice)
                            ?.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4 text-sm text-gray-800">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-800 text-center">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-800 text-center">
                                  Rs.
                                  {Number(item.price).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">
                                  Rs.
                                  {Number(item.total).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-4 text-sm font-semibold text-right bg-gray-50 border-t border-gray-200"
                            >
                              Total:
                            </td>
                            <td className="px-6 py-4 text-sm font-bold bg-gray-50 border-t border-gray-200 text-center">
                              Rs.
                              {Number(
                                invoices.find(
                                  (inv) => inv._id === selectedInvoice
                                )?.total
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Popup Footer with Close Button */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-lg">
                      <button
                        onClick={() => setSelectedInvoice(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-150 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {isModalOpen && (
          <UpdateCustomer
            setIsModalOpen={setIsModalOpen}
            customerId={customer_id}
          />
        )}
      </div>
    </div>
  );
}
