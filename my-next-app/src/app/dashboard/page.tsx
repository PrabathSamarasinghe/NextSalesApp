'use client';
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Users,
  Package,
  FileText,
  BarChart2,
  TrendingUp,
  DollarSign,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddCustomer from "@/components/AddCustomer";


interface Stats {
  totalSales: string;
  invoicesIssued: number;
  activeCustomers: number;
  totalProducts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSales: '0',
    invoicesIssued: 0,
    activeCustomers: 0,
    totalProducts: 0
  });

//   const loadingContext = useContext(LoadingContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  interface Invoice {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: boolean;
    isCancelled: boolean;
  }

  interface TopProduct {
    name: string;
    sales: string;
    quantity: number;
  }
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const router = useRouter();

//   useEffect(() => {
//     const fetchedInvoices = () => {
//       loadingContext.setLoading(true);
//       api
//         .get("/invoices/recent/invoices")
//         .then((response) => {
//           const invoices = response.data.map((invoice: any) => ({
//             id: invoice.invoiceNumber,
//             customer: invoice.customerDetails.name,
//             date: new Date(invoice.date).toLocaleDateString(),
//             amount: `Rs.${invoice.total.toFixed(2)}`,
//             status: invoice.isPaid,
//             isCancelled: invoice.isCancelled,
//           }));

//           setRecentInvoices(invoices);
//         })
//         .catch((error) =>
//           console.error("Error fetching recent invoices:", error)
//         );
//     };

//     const fetchTopProducts = () => {
//       api
//         .get("/invoices/products/top-selling")
//         .then((response) => {
//           const products = response.data.map((product: any) => ({
//             name: product.productName,
//             sales: `Rs.${product.totalRevenue.toFixed(2)}`,
//             quantity: product.totalQuantity,
//           }));

//           setTopProducts(products);
//         })
//         .catch((error) => console.error("Error fetching top products:", error));
//     };

//     const fetchStats = () => {
//       api
//         .get("/admin/statistics")
//         .then((response) => {
//           const stats = response.data;
//           setStats({
//             totalSales: `Rs.${stats.totalRevenue
//               .toFixed(2)
//               .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
//             invoicesIssued: stats.totalInvoices,
//             activeCustomers: stats.totalCustomers,
//             totalProducts: stats.totalProducts,
//           });
//         })
//         .catch((error) => console.error("Error fetching stats:", error))
//         .finally(() => loadingContext.setLoading(false));
//     };
//     fetchStats();
//     fetchTopProducts();
//     fetchedInvoices();
//   }, []);
useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await fetch("/api/admin/stats");
            const data = await response.json();
            setStats({
            totalSales: `Rs.${data.totalRevenue
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
            invoicesIssued: data.totalInvoices,
            activeCustomers: data.totalCustomers,
            totalProducts: data.totalProducts,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
        }
        fetchStats();
}, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's an overview of your business.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sales-report"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Sales Report
            </Link>
            <Link
              href="/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 ease-in-out"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-150 ease-in-out">
            <div className="flex items-start">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <DollarSign className="text-blue-600 w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Sales
                </h3>
                <div className="flex items-baseline flex-wrap">
                  <p className="text-xl font-bold text-gray-900 break-all">
                    {stats.totalSales}
                  </p>
                  <span className="ml-2 text-xs font-medium text-green-600">
                    +12.5%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-150 ease-in-out cursor-pointer"
            onClick={() => router.push("/invoices")}
          >
            <div className="flex items-start">
              <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                <FileText className="text-green-600 w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Invoices Issued
                </h3>
                <div className="flex items-baseline flex-wrap">
                  <p className="text-xl font-bold text-gray-900">
                    {stats.invoicesIssued}
                  </p>
                  <span className="ml-2 text-xs font-medium text-green-600">
                    +8.2%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-150 ease-in-out cursor-pointer"
            onClick={() => router.push("/customers")}
          >
            <div className="flex items-start">
              <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                <Users className="text-purple-600 w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Active Customers
                </h3>
                <div className="flex items-baseline flex-wrap">
                  <p className="text-xl font-bold text-gray-900">
                    {stats.activeCustomers}
                  </p>
                  <span className="ml-2 text-xs font-medium text-green-600">
                    +5.4%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-150 ease-in-out cursor-pointer"
            onClick={() => router.push("/products")}
          >
            <div className="flex items-start">
              <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
                <Package className="text-amber-600 w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Products
                </h3>
                <div className="flex items-baseline flex-wrap">
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </p>
                  <span className="ml-2 text-xs font-medium text-blue-600">
                    +2.1%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Invoices
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Latest invoice activity
                </p>
              </div>
              <button
                onClick={() => router.push("/invoices")}
                className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition duration-150 ease-in-out"
              >
                View All <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="p-6">
              <ul className="divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg px-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.customer}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {invoice.id}
                          </span>

                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {invoice.date}
                          </span>
                          {invoice.isCancelled && (
                            <span className="text-xs text-red-500 ml-2 font-medium">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-4">
                          {invoice.amount}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            invoice.status
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.status ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Best performing products
                </p>
              </div>
              <button
                onClick={() => router.push("/products")}
                className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition duration-150 ease-in-out"
              >
                View All <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="p-6">
              <ul className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <li
                    key={index}
                    className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg px-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.quantity} units sold
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {product.sales}
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <AddCustomer setIsModalOpen={setIsModalOpen} />}
    </div>
  );
}
