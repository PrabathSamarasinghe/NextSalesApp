'use client';
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

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
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        const totalResponse = await fetch(`/api/invoice/other/${customer_id}`);
        if (totalResponse.ok) {
          const totalData = await totalResponse.json();
          setCustomer(prev => ({ ...prev, totalSpent: totalData.totalSpent }));
        } else {
          console.error("Failed to fetch total spent");
        }
  
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };
  
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/invoice/customersInvoices/${customer_id}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-blue-600"
            onClick={() => {
              navigate.push("/customers");
            }}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Customers</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-blue-50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-2xl font-medium text-gray-800">
                  {customer.name}
                </h2>
                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-sm">Customer since Jan 2025</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-sm text-gray-600 mb-1">
                  Total Purchase Value
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  Rs.
                  {(customer.totalSpent || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Mail size={18} className="text-gray-500" />
                  <h3 className="ml-2 text-sm font-medium text-gray-700">
                    Email
                  </h3>
                </div>
                <p className="mt-2 text-gray-900">{customer.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-500" />
                  <h3 className="ml-2 text-sm font-medium text-gray-700">
                    Phone
                  </h3>
                </div>
                <p className="mt-2 text-gray-900">{customer.phone}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <MapPin size={18} className="text-gray-500" />
                  <h3 className="ml-2 text-sm font-medium text-gray-700">
                    Address
                  </h3>
                </div>
                <p className="mt-2 text-gray-900">{customer.address}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Purchase History
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-center text-sm font-medium">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Rs.
                          {(Number(invoice.total) || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {invoice.isPaid ? (
                            <span className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-800 border border-green-300 w-full">
                              Paid
                            </span>
                          ) : (
                            <button
                              onClick={async () => {
                                await fetch(
                                  `/api/invoice/paid`,{
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      invoiceId: invoice._id,
                                    }),
                                  }
                                );
                              }}
                              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <button
                            onClick={() =>
                              setSelectedInvoice(
                                invoice._id === selectedInvoice
                                  ? null
                                  : invoice._id
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Details Section */}
              {selectedInvoice && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-x-auto text-center">
                  <h4 className="text-md font-medium text-gray-800 mb-4">
                    Invoice Details -{" "}
                    {
                      invoices.find((inv) => inv._id === selectedInvoice)
                        ?.invoiceNumber
                    }
                  </h4>

                  <table className="min-w-full bg-white ">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ">
                          Product
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices
                        .find((inv) => inv._id === selectedInvoice)
                        ?.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              Rs.
                              {Number(item.price).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Rs.
                              {Number(item.total).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-medium text-center bg-gray-200"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold bg-gray-200">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
