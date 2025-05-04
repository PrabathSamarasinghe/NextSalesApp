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
} from "lucide-react";

import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Link from "next/link";


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
  const [invoicesStructure, setInvoicesStructure] = useState<
    InvoiceStructure[]
  >([]);
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
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceStructure | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useRouter();

  useLayoutEffect(() => {
    const fetchRole = async () => {
      try{

        const response = await fetch("/api/admin/auth");
        const data = await response.json();
        setRole(data.decoded.role)
      }catch(error){
        console.error("Error fetching role:", error);
      }
    }
    const fetchInvoices = async () => {
      const response = await fetch("/api/invoice/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setInvoicesStructure(data.invoices);
      setIsLoading(false);
    };
    fetchRole();
    fetchInvoices();
  }, []); // Remove invoicesStructure dependency to prevent infinite loop

  // Filter and sort invoices first - MOVED THIS SECTION BEFORE PAGINATION
  const filteredInvoices = invoicesStructure
    .filter((invoice) => {
      // Search term filtering
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customerDetails.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filtering
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && invoice.isPaid) ||
        (statusFilter === "pending" && !invoice.isPaid);

      // Date range filtering
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

  // Then apply pagination to the filtered results
  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = filteredInvoices.slice(firstPostIndex, lastPostIndex);

  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [isAdvancePaymentClicked, setIsAdvancePaymentClicked] = useState(false);
  

  // Reset to first page when filters change
  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSort = (field: string) => {
    setCurrentSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (field: string) => {
    if (currentSort.field !== field)
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return currentSort.direction === "asc" ? (
      <ChevronDown className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
    );
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
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
      console.log("Invoice deleted successfully");
      // Refresh invoices after deletion
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

  const StatusBadge = ({ isPaid }: { isPaid: boolean }) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium text-center";
    const statusClasses = isPaid
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";

    return (
      <span className={`${baseClasses} ${statusClasses}`}>
        {isPaid ? "Paid" : "Pending"}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        {role === "admin" && <div className="flex space-x-3">
          <Link
            href="/newInvoice"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          >
            New Invoice
          </Link>
        </div>}
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between flex-wrap gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative">
            <button
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border border-gray-200 bg-white z-50 p-5 space-y-5">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                    onClick={() => {
                      handleFilterChange("all");
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                    onClick={() => setFilterOpen(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                    >
                      <button
                        className="flex items-center justify-center mx-auto focus:outline-none"
                        onClick={() => handleSort("id")}
                      >
                        Invoice No. {getSortIcon("id")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                    >
                      <button
                        className="flex items-center justify-center mx-auto focus:outline-none"
                        onClick={() => handleSort("customer")}
                      >
                        Customer {getSortIcon("customer")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                    >
                      <button
                        className="flex items-center justify-center mx-auto focus:outline-none"
                        onClick={() => handleSort("date")}
                      >
                        Date {getSortIcon("date")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                    >
                      <button
                        className="flex items-center justify-center mx-auto focus:outline-none"
                        onClick={() => handleSort("total")}
                      >
                        Amount {getSortIcon("total")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                    >
                      Status
                    </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                      >
                        Actions
                      </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPosts.length > 0 ? (
                    currentPosts.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-center ${
                            invoice.isCancelled ? "line-through" : ""
                          }`}
                        >
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {invoice.customerDetails.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          Rs.
                          {invoice.total
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <StatusBadge isPaid={invoice.isPaid} />
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                                onClick={() => handleViewInvoice(invoice._id)}
                                >
                                <Eye className="h-4 w-4" />
                              </button>

                              {role === "admin" && !invoice.isCancelled && (
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to cancel this invoice?"
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
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No invoices found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {filteredInvoices.length > 0 ? firstPostIndex + 1 : 0} to{" "}
                  {Math.min(lastPostIndex, filteredInvoices.length)} of{" "}
                  {filteredInvoices.length} results
                </div>
                <div className="flex-shrink-0">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredInvoices.length / itemsPerPage
                    )}
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
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Invoice Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="mb-6">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                      Invoice Number
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                      Customer
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      {selectedInvoice.customerDetails.name}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-6 text-right">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                      Date
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      {new Date(selectedInvoice.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                      Status
                    </p>
                    <div className="grid sm:flex items-center justify-end">
                      <StatusBadge isPaid={selectedInvoice.isPaid} />
                       {role === "admin" && <> {!selectedInvoice.isPaid && (
                          <button
                            className="sm:ml-4 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={async () => {
                              setIsAdvancePaymentClicked(true);
                            }}
                          >
                            Advance Payment
                          </button>
                        )}
                      {!selectedInvoice.isPaid && (
                        <button
                          className="sm:ml-4 px-4 py-2 bg-emerald-600 text-white font-medium rounded hover:bg-emerald-700 transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 my-2 sm:my-0"
                          onClick={async () => {
                            try {
                              if(confirm("Are you sure you want to mark this invoice as paid?")) {
                              await fetch(`/api/invoice/paid`, {
                                method: "POST",
                                body: JSON.stringify({
                                  invoiceId: selectedInvoice._id,
                                }),
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              });
                              setInvoicesStructure((prev) =>
                                prev.map((invoice) =>
                                  invoice._id === selectedInvoice._id
                                    ? { ...invoice, isPaid: true }
                                    : invoice
                                )
                              );
                              setSelectedInvoice((prev) => ({
                                ...prev!,
                                isPaid: true,
                              }));
                            }
                            } catch (error) {
                              console.error(
                                "Error marking invoice as paid:",
                                error
                              );
                            }
                          }}
                        >
                          Mark as Paid
                        </button>
                      )}</>}
                    </div>
                  </div>
                </div>
              </div>

              {selectedInvoice.isCancelled && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        This invoice has been cancelled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Item</th>
                      <th className="px-6 py-3 text-right">Quantity</th>
                      <th className="px-6 py-3 text-right">Price</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                          Rs.
                          {item.price
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                          Rs.
                          {(item.quantity * item.price)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="space-y-3">
                  
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Advance Payment
                      </span>
                      <span className="text-gray-800">
                        Rs.
                        {(selectedInvoice.advance || 0)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </div>
                
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      Rs.
                      {selectedInvoice.total
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advance Payment Modal */}
      {isAdvancePaymentClicked && selectedInvoice && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Advance Payment
            </h2>
            <p className="text-gray-600 mb-4">
              Enter the amount for advance payment:
            </p>
            <input
              type="number"
              // value={advancePayment===0 ? "" : advancePayment}
              placeholder="Enter amount"
              onChange={(e) => setAdvancePayment(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                onClick={() => setIsAdvancePaymentClicked(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                onClick={async () => {
                  try {
                    await fetch(`/api/invoice/advance`, {
                      method: "POST",
                      body: JSON.stringify({
                        invoiceId: selectedInvoice._id,
                        paymentData: advancePayment,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    setInvoicesStructure((prev) =>
                      prev.map((invoice) =>
                        invoice._id === selectedInvoice._id
                          ? { ...invoice, advance: advancePayment }
                          : invoice
                      )
                    );
                    setSelectedInvoice((prev) => ({
                      ...prev!,
                      advance: advancePayment,
                    }));
                  } catch (error) {
                    console.error("Error updating advance payment:", error);
                  }
                  setIsAdvancePaymentClicked(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}