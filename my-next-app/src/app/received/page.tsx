"use client";
import { useState, useLayoutEffect } from "react";
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import LoadingPage from "@/components/loadingPage";

interface InvoiceItem {
  id: number;
  name: string;
  product: string;
  quantity: number;
  category: string;
  price: number;
  total: number;
}

interface ReceivedInvoiceStructure {
  _id: string;
  invoiceNumber: string;
  supplier: string;
  date: string;
  total: number;
  notes: string;
  items?: InvoiceItem[];
}

export default function ReceivedInvoicesList() {
  const [role, setRole] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [invoicesStructure, setInvoicesStructure] = useState<ReceivedInvoiceStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSort, setCurrentSort] = useState({
    field: "date",
    direction: "desc",
  });
  const [dateRange] = useState({ start: "", end: "" });
  const [selectedInvoice, setSelectedInvoice] = useState<ReceivedInvoiceStructure | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useRouter();

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
        const response = await fetch("/api/recievedInv/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setInvoicesStructure(data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setInvoicesStructure([]);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };
    
    fetchRole();
    fetchInvoices();
  }, []);

  const filteredInvoices = Array.isArray(invoicesStructure) 
    ? invoicesStructure
        .filter((invoice) => {
          const matchesSearch =
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase());

          let matchesDate = true;
          if (dateRange.start) {
            matchesDate = matchesDate && invoice.date >= dateRange.start;
          }
          if (dateRange.end) {
            matchesDate = matchesDate && invoice.date <= dateRange.end;
          }

          return matchesSearch && matchesDate;
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
          } else if (currentSort.field === "supplier") {
            return currentSort.direction === "asc"
              ? a.supplier.localeCompare(b.supplier)
              : b.supplier.localeCompare(a.supplier);
          }
          return 0;
        }) 
    : [];

  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = filteredInvoices.slice(firstPostIndex, lastPostIndex);

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
    if (currentSort.field !== field) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-70" />;
    return currentSort.direction === "asc" ? (
      <ChevronDown className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
    );
  };

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/recievedInv/view`, {        
        method: "POST",
        body: JSON.stringify({ id: invoiceId }),
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

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Received Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and view all received supplier invoices</p>
          </div>
          
          {role === "admin" && (
            <div className="flex space-x-3">
              <Link
                href="/received-invoice"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                New Received Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex items-center">
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            onClick={() => navigate.push("/products")}
            title="Back to Products"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Products</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-all duration-200"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center focus:outline-none hover:text-gray-700 transition-colors duration-200"
                          onClick={() => handleSort("id")}
                        >
                          Invoice No. {getSortIcon("id")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center focus:outline-none hover:text-gray-700 transition-colors duration-200"
                          onClick={() => handleSort("supplier")}
                        >
                          Supplier {getSortIcon("supplier")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center focus:outline-none hover:text-gray-700 transition-colors duration-200"
                          onClick={() => handleSort("date")}
                        >
                          Date {getSortIcon("date")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          className="flex items-center focus:outline-none hover:text-gray-700 transition-colors duration-200"
                          onClick={() => handleSort("total")}
                        >
                          Amount {getSortIcon("total")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPosts.length > 0 ? (
                      currentPosts.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                              {invoice.invoiceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invoice.supplier}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(invoice.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rs. {invoice.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                              title="View"
                              onClick={() => handleViewInvoice(invoice._id)}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <div className="text-sm text-gray-500 py-8">
                            No invoices found matching your criteria
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{filteredInvoices.length > 0 ? firstPostIndex + 1 : 0}</span> to{" "}
                  <span className="font-medium">{Math.min(lastPostIndex, filteredInvoices.length)}</span> of{" "}
                  <span className="font-medium">{filteredInvoices.length}</span> results
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredInvoices.length / itemsPerPage)}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">
                Invoice Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
                      Invoice Number
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
                      Supplier
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {selectedInvoice.supplier}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
                      Date
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {new Date(selectedInvoice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="mb-8">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                    Notes
                  </p>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedInvoice.notes}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-8 overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          Rs. {item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          Rs. {item.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    Rs. {selectedInvoice.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}