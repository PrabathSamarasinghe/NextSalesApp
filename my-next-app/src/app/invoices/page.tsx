"use client";
import { useState, useLayoutEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Trash2,
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  User,
  CheckCircle,
  Clock,
  X,
  Ban,
  Edit3,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import LoadingPage from "@/components/loadingPage";

interface CustomerDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  epfNumber?: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  category: string;
  price: number;
}

interface InvoiceStructure {
  _id: string;
  invoiceNumber: string;
  customerDetails: CustomerDetails;
  date: string;
  total: number;
  isPaid: boolean;
  isCancelled: boolean;
  advance?: number;
  items?: InvoiceItem[];
}

export default function InvoicesList() {
  const [role, setRole] = useState<string>();
  const [invoicesStructure, setInvoicesStructure] = useState<InvoiceStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState({
    field: "date",
    direction: "desc",
  });
  const [dateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceStructure | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useRouter();
  const [pendingAmount, setPendingAmount] = useState(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [isAdvancePaymentClicked, setIsAdvancePaymentClicked] = useState(false);
  const [loading, setLoading] = useState(true);

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

    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoice/getall", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching invoices:", data.error);
          return;
        }

        const totalPending = data.invoices.reduce(
          (sum: number, invoice: InvoiceStructure) => {
            return invoice.isPaid ? sum : sum + invoice.total;
          },
          0
        );

        const totalAdvance = data.invoices.reduce(
          (sum: number, invoice: InvoiceStructure) => {
            return invoice.advance ? sum + invoice.advance : sum;
          },
          0
        );

        setPendingAmount(totalPending - totalAdvance);
        setInvoicesStructure(data.invoices);
        setIsLoading(false);
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchInvoices:", error);
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchRole();
    fetchInvoices();
  }, []);

  const filteredInvoices = invoicesStructure
    .filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && invoice.isPaid) ||
        (statusFilter === "pending" && !invoice.isPaid);

      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && invoice.date >= dateRange.start;
      }
      if (dateRange.end) {
        matchesDate = matchesDate && invoice.date <= dateRange.end;
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (currentSort.field === "date") {
        return currentSort.direction === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (currentSort.field === "total") {
        return currentSort.direction === "asc"
          ? a.total - b.total
          : b.total - a.total;
      } else if (currentSort.field === "customer") {
        return currentSort.direction === "asc"
          ? a.customerDetails.name.localeCompare(b.customerDetails.name)
          : b.customerDetails.name.localeCompare(a.customerDetails.name);
      }
      return 0;
    });

  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = filteredInvoices.slice(firstPostIndex, lastPostIndex);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setCurrentSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (field: string) => {
    if (currentSort.field !== field)
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    return currentSort.direction === "asc" ? (
      <ChevronDown className="ml-1 h-4 w-4 text-indigo-600" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 rotate-180 text-indigo-600" />
    );
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await fetch(`/api/invoice/delete`, {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setInvoicesStructure((prev) =>
        prev.filter((invoice) => invoice._id !== invoiceId)
      );
      const response = await fetch("/api/invoice/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setInvoicesStructure(data.invoices);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    try {
      await fetch(`/api/invoice/cancel`, {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setInvoicesStructure((prev) =>
        prev.filter((invoice) => invoice._id !== invoiceId)
      );
      const response = await fetch("/api/invoice/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setInvoicesStructure(data.invoices);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoice/getinvoice`, {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSelectedInvoice(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await fetch(`/api/invoice/paid`, {
        method: "POST",
        body: JSON.stringify({ invoiceId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Refresh the invoices list
      const response = await fetch("/api/invoice/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setInvoicesStructure(data.invoices);
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  const handleAddAdvancePayment = async (invoiceId: string) => {
    console.log("Adding advance payment:", advancePayment, "for invoice:", invoiceId);
    
    try {
      await fetch(`/api/invoice/advance`, {
        method: "POST",
        body: JSON.stringify({ 
          invoiceId,
          paymentData: advancePayment 
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Refresh the invoices list
      const response = await fetch("/api/invoice/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setInvoicesStructure(data.invoices);
      setIsAdvancePaymentClicked(false);
      setAdvancePayment(0);
    } catch (error) {
      console.error("Error adding advance payment:", error);
    }
  };

  const StatusBadge = ({ isPaid }: { isPaid: boolean }) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    const statusClasses = isPaid
      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
      : "bg-amber-100 text-amber-800 border border-amber-200";

    return (
      <span className={`${baseClasses} ${statusClasses}`}>
        {isPaid ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </>
        ) : (
          <>
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </>
        )}
      </span>
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Invoice Management
            </h1>
            <p className="text-gray-600">Manage and track all your invoices</p>
          </div>
          {role === "admin" && (
            <div className="flex space-x-3">
              <Link
                href="/newInvoice"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Navigation and Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-4 lg:mb-0"
            onClick={() => navigate.push("/dashboard")}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pending</p>
                  <p className="text-xl font-bold text-gray-900">
                    Rs. {pendingAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Search and Filter Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search invoices or customers..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <button
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm bg-white"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="mr-2 h-5 w-5 text-gray-500" />
                  <span className="font-medium">Filter</span>
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      filterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-gray-200 bg-white z-50 p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Payment Status
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid Only</option>
                        <option value="pending">Pending Only</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
                        onClick={() => handleFilterChange("all")}
                      >
                        Reset
                      </button>
                      <button
                        className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition duration-200"
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center hover:text-indigo-600 transition-colors duration-200"
                          onClick={() => handleSort("id")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Invoice No. {getSortIcon("id")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center hover:text-indigo-600 transition-colors duration-200"
                          onClick={() => handleSort("customer")}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Customer {getSortIcon("customer")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center hover:text-indigo-600 transition-colors duration-200"
                          onClick={() => handleSort("date")}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Date {getSortIcon("date")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center ml-auto hover:text-indigo-600 transition-colors duration-200"
                          onClick={() => handleSort("total")}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Amount {getSortIcon("total")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPosts.length > 0 ? (
                      currentPosts.map((invoice, index) => (
                        <tr
                          key={invoice._id}
                          className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-bold text-indigo-600">
                                <span className={invoice.isCancelled ? "line-through text-gray-400" : ""}>
                                  {invoice.invoiceNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.customerDetails.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {new Date(invoice.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-gray-900">
                              Rs. {invoice.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <StatusBadge isPaid={invoice.isPaid} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                                title="View Details"
                                onClick={() => handleViewInvoice(invoice._id)}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {role === "admin" && !invoice.isCancelled && (
                                <Link
                                  href={`/updateInvoice/${invoice._id}`}
                                  className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                                  title="Edit Invoice"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Link>
                              )}
                              {role === "admin" && !invoice.isCancelled && (
                                <button
                                  className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-all duration-200"
                                  title="Cancel Invoice"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to mark this invoice as cancelled? This cannot be undone."
                                      )
                                    ) {
                                      handleCancelInvoice(invoice._id);
                                    }
                                  }}
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                              {role === "admin" && !invoice.isCancelled && (
                                <button
                                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                                  title="Delete Invoice"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this invoice? This cannot be undone."
                                      )
                                    ) {
                                      handleDeleteInvoice(invoice._id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No invoices found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-700 font-medium">
                    Showing {filteredInvoices.length > 0 ? firstPostIndex + 1 : 0} to{" "}
                    {Math.min(lastPostIndex, filteredInvoices.length)} of{" "}
                    {filteredInvoices.length} results
                  </div>
                  <div className="flex-shrink-0">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(filteredInvoices.length / itemsPerPage)}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Invoice Details Modal */}
        {showDetailsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setIsAdvancePaymentClicked(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <p className="text-sm font-medium text-indigo-600 mb-1">Invoice Number</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <p className="text-sm font-medium text-blue-600 mb-1">Customer</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedInvoice.customerDetails.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <p className="text-sm font-medium text-green-600 mb-1">Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(selectedInvoice.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                      <p className="text-sm font-medium text-amber-600 mb-1">Status</p>
                      <div className="flex flex-col space-y-3">
                        <StatusBadge isPaid={selectedInvoice.isPaid} />
                        {selectedInvoice.advance && (
                          <div className="text-sm text-gray-600">
                            Advance: Rs. {selectedInvoice.advance.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            Rs. {item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            Rs. {(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                          Total Amount
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          Rs. {selectedInvoice.total.toFixed(2)}
                        </td>
                      </tr>
                      {selectedInvoice.advance && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                            Advance Paid
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            Rs. {selectedInvoice.advance.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                          Balance Due
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          Rs. {(selectedInvoice.total - (selectedInvoice.advance || 0)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerDetails.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerDetails.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerDetails.address}</p>
                      </div>
                      {selectedInvoice.customerDetails.epfNumber && (
                        <div>
                          <p className="text-sm text-gray-500">EPF Number</p>
                          <p className="text-sm font-medium text-gray-900">{selectedInvoice.customerDetails.epfNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Actions */}
                  {role === "admin" && !selectedInvoice.isPaid && !selectedInvoice.isCancelled && (
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Actions</h3>
                      <div className="space-y-4">
                        {!isAdvancePaymentClicked ? (
                          <>
                            <button
                              className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                              onClick={() => setIsAdvancePaymentClicked(true)}
                            >
                              Add Advance Payment
                            </button>
                            <button
                              className="w-full px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                              onClick={() => {
                                if (confirm("Are you sure you want to mark this invoice as paid?")) {
                                  handleMarkAsPaid(selectedInvoice._id);
                                }
                              }}
                            >
                              Mark as Fully Paid
                            </button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Advance Payment Amount
                              </label>
                              <input
                                type="number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={advancePayment}
                                onChange={(e) => setAdvancePayment(Number(e.target.value))}
                                min="0"
                                max={selectedInvoice.total}
                                step="0.01"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                onClick={() => {
                                  setIsAdvancePaymentClicked(false);
                                  setAdvancePayment(0);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                                onClick={() => {
                                  if (advancePayment > 0 && advancePayment <= selectedInvoice.total) {
                                    handleAddAdvancePayment(selectedInvoice._id);
                                  } else {
                                    alert("Please enter a valid advance amount");
                                  }
                                }}
                              >
                                Confirm Advance
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}