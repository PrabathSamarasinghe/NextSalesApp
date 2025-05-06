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
  const [role, setRole] = useState<string>(); // Replace with actual role fetching logic
  const [loading, setLoading] = useState(true);
  const [invoicesStructure, setInvoicesStructure] = useState<
    ReceivedInvoiceStructure[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSort, setCurrentSort] = useState({
    field: "date",
    direction: "desc",
  });
  const [dateRange] = useState({ start: "", end: "" });
  const [selectedInvoice, setSelectedInvoice] =
    useState<ReceivedInvoiceStructure | null>(null);
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
      try {
        const response = await fetch("/api/recievedInv/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json();
        // Check if data.invoices exists, otherwise use an empty array
        setInvoicesStructure(data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setInvoicesStructure([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
        setLoading(false); // Set loading to false after fetching invoices
      }
    };
    fetchRole();
    fetchInvoices();
  }, []);

  // Ensure invoicesStructure is an array before filtering
  const filteredInvoices = Array.isArray(invoicesStructure) ? invoicesStructure
    .filter((invoice) => {
      // Search term filtering
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filtering
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
    }) : [];

  // Then apply pagination to the filtered results
  const lastPostIndex = currentPage * itemsPerPage;
  const firstPostIndex = lastPostIndex - itemsPerPage;
  const currentPosts = filteredInvoices.slice(firstPostIndex, lastPostIndex);

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

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      console.log("Fetching invoice details for ID:", invoiceId);
      const response = await fetch(`/api/recievedInv/view`, {        
        method: "POST",
        body: JSON.stringify({ id : invoiceId }),
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Received Invoices</h1>
        {role === "admin" && <div className="flex space-x-3">
          <Link
            href="/received-invoice"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          >
            New Received Invoice
          </Link>
        </div>}
      </div>

      <div className="flex items-center mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={() => navigate.push("/products")}
          title="Back to Products"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Products</span>
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
                        onClick={() => handleSort("supplier")}
                      >
                        Supplier {getSortIcon("supplier")}
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPosts.length > 0 ? (
                    currentPosts.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-center">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {invoice.supplier}
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
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                              onClick={() => handleViewInvoice(invoice._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
                Received Invoice Details
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
                      Supplier
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      {selectedInvoice.supplier}
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
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                    Notes
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedInvoice.notes}
                  </p>
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
                          <span className="text-gray-50 bg-gray-400 text-xs ml-2 row-auto px-2 py-1 rounded-[10px]">
                            {item.category}
                          </span>
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
                          {item.total
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center pt-3">
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
      )}
    </div>
  );
}