"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  Mail,
  Plus,
  Phone,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import UpdateCustomer from "@/components/UpdateCustomer";

interface CustomerId {
  params: {
    customer_id: string;
  };
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
  
  useEffect(() => {
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

    if (customer_id) {
      fetchCustomer();
      fetchInvoices();
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
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
          >
            <Plus size={18} className="mr-2" />
            Update Customer
          </button>
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
                <p className="mt-3 text-gray-800 font-medium">{customer.email || "Not provided"}</p>
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
                <p className="mt-3 text-gray-800 font-medium">{customer.phone || "Not provided"}</p>
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
                <p className="mt-3 text-gray-800 font-medium">{customer.address || "Not provided"}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Purchase History
                </h3>
                {invoices.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} found
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
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors duration-150">
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
                              <button 
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-50"
                                title="Download invoice"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No invoices found for this customer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Details Section */}
              {selectedInvoice && (
                <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800">
                      Invoice Details - {" "}
                      <span className="text-blue-700 font-semibold">
                        {invoices.find((inv) => inv._id === selectedInvoice)?.invoiceNumber}
                      </span>
                    </h4>
                  </div>

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
                            <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
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
                              invoices.find((inv) => inv._id === selectedInvoice)
                                ?.total
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
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