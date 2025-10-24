"use client";
import { useState, useLayoutEffect } from "react";
import useDebounce from "@/lib/hooks/useDebounce";
import {
  Search,
  ArrowUpDown,
  ArrowLeft,
  ChevronRight,
  Plus,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
// import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/navigation";

import AddCustomer from "@/components/AddCustomer";
import Pagination from "@/components/Pagination";
import LoadingPage from "@/components/loadingPage";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  epfNumber: string;
}

interface Customer extends CustomerDetails {
  _id: string;
  totalSpent: number;
  lastPurchase: string;
  [key: string]: string | number;
}

export default function CustomerList() {
  const [role, setRole] = useState<string>(); // Replace with actual role fetching logic
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useRouter(); // useRouter from next/navigation
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false); // Loading state for customer data
  // State for new customer form
  //   const loadingContext = useContext(LoadingContext);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search input so we don't call API for every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    fetchRole();
  }, []);

  useLayoutEffect(() => {
    const fetchCustomers = async () => {
      // Only perform search when debounced term is empty (show all) or length >= 2
      if (!(debouncedSearchTerm === "" || debouncedSearchTerm.length >= 2)) {
        // skip API call for single-character search
        return;
      }

      setLoading(true);
      try {
        // Build query parameters for backend pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: debouncedSearchTerm,
          sortField: sortField,
          sortDirection: sortDirection,
        });

        const response = await fetch(`/api/customer/paginated?${params}`);
        const data = await response.json();

        if (data.customers) {
          // Fetch additional data for each customer (totalSpent and lastPurchase)
          const customersWithTotals = await Promise.all(
            data.customers.map(async (customer: Customer) => {
              try {
                const response = await fetch(`/api/invoice/other/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ customerId: customer._id }),
                });
                const invoiceData = await response.json();
                return {
                  ...customer,
                  totalSpent: invoiceData.totalSpent,
                  lastPurchase: invoiceData.lastPurchaseDate,
                };
              } catch (err) {
                console.error(
                  `Error fetching totalSpent for customer ${customer._id}:`,
                  err
                );
                return { ...customer, totalSpent: 0, lastPurchase: null };
              }
            })
          );

          setCustomers(customersWithTotals);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, debouncedSearchTerm, sortField, sortDirection, itemsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const viewCustomerDetails = (customerId: string) => {
    navigate.push(`/customerdata/${customerId}`);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Customer Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your customer relationships
                </p>
              </div>
            </div>
            {role === "admin" && (
              <button
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add New Customer
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center mb-6">
            <button
              className="group flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-200"
              onClick={() => navigate.push("/dashboard")}
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.lastPurchase).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 0,
                  }).format(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Search Section */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center group">
                      <span>Customer Name</span>
                      <ArrowUpDown 
                        size={14} 
                        className={`ml-2 transition-all duration-200 ${
                          sortField === "name" 
                            ? "text-blue-600 opacity-100" 
                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center group">
                      <span>Email</span>
                      <ArrowUpDown 
                        size={14} 
                        className={`ml-2 transition-all duration-200 ${
                          sortField === "email" 
                            ? "text-blue-600 opacity-100" 
                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => handleSort("phone")}
                  >
                    <div className="flex items-center group">
                      <span>Phone</span>
                      <ArrowUpDown 
                        size={14} 
                        className={`ml-2 transition-all duration-200 ${
                          sortField === "phone" 
                            ? "text-blue-600 opacity-100" 
                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => handleSort("totalSpent")}
                  >
                    <div className="flex items-center group">
                      <span>Total Spent</span>
                      <ArrowUpDown 
                        size={14} 
                        className={`ml-2 transition-all duration-200 ${
                          sortField === "totalSpent" 
                            ? "text-blue-600 opacity-100" 
                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => handleSort("lastPurchase")}
                  >
                    <div className="flex items-center group">
                      <span>Last Purchase</span>
                      <ArrowUpDown 
                        size={14} 
                        className={`ml-2 transition-all duration-200 ${
                          sortField === "lastPurchase" 
                            ? "text-blue-600 opacity-100" 
                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <tr 
                      key={customer._id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-mono">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.totalSpent
                            ? `Rs.${new Intl.NumberFormat("en-IN", {
                                minimumFractionDigits: 2,
                              }).format(Number(customer.totalSpent))}`
                            : "Rs.0.00"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {customer.lastPurchase ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {formatDate(customer.lastPurchase)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No purchases
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewCustomerDetails(customer._id)}
                          className="group inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all duration-200 hover:shadow-md"
                        >
                          <span className="font-medium">View Details</span>
                          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-500 mb-2">No customers found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first customer"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                Showing <span className="font-medium text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-medium text-gray-900">{totalItems}</span> results
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        {/* Add Customer Modal */}
        {isModalOpen && <AddCustomer setIsModalOpen={setIsModalOpen} />}
      </div>
    </div>
  );
}