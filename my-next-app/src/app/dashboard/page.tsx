"use client";
import { useState, useLayoutEffect } from "react";
import {
  ChevronRight,
  Users,
  Package,
  FileText,
  BarChart2,
  TrendingUp,
  DollarSign,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddCustomer from "@/components/AddCustomer";
import LoadingPage from "@/components/loadingPage";


interface Stats {
  totalSales: string;
  invoicesIssued: number;
  activeCustomers: number;
  totalProducts: number;
}

export default function Dashboard() {
  const [role, setRole] = useState<string>()
  const [stats, setStats] = useState<Stats>({
    totalSales: "0",
    invoicesIssued: 0,
    activeCustomers: 0,
    totalProducts: 0,
  });
  const [presentages, setPresentages] = useState({
    totalSales: 0,
    invoicesIssued: 0,
    activeCustomers: 0,
    totalProducts: 0,
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
    category: string;
  }
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const router = useRouter();

  const [loading, setLoading] = useState(true);

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
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        // Format the new stats data
        const newStats = {
          totalSales: `Rs.${data.totalRevenue
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          invoicesIssued: data.totalInvoices,
          activeCustomers: data.totalCustomers,
          totalProducts: data.totalProducts,
        };

        // Update the stats state
        setStats(newStats);

        // Calculate percentages based on previous stats from localStorage
        const savedStats = localStorage.getItem("stats");
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);

          // Helper function to safely calculate percentage change
          const calculatePercentage = (current: number, previous: string) => {
            const prev =
              typeof previous === "string"
                ? parseFloat(previous.replace(/[^0-9.-]+/g, ""))
                : previous;

            if (!prev || prev === 0) return 0;
            return Math.floor(((current - prev) / prev) * 100);
          };

          setPresentages({
            totalSales: calculatePercentage(
              data.totalRevenue,
              parsedStats.totalSales
            ),
            invoicesIssued: calculatePercentage(
              data.totalInvoices,
              parsedStats.invoicesIssued
            ),
            activeCustomers: calculatePercentage(
              data.totalCustomers,
              parsedStats.activeCustomers
            ),
            totalProducts: calculatePercentage(
              data.totalProducts,
              parsedStats.totalProducts
            ),
          });
        }

        // Save the raw data for future percentage calculations
        setTimeout(() => {
          localStorage.setItem(
            "stats",
            JSON.stringify({
              totalSales: data.totalRevenue,
              invoicesIssued: data.totalInvoices,
              activeCustomers: data.totalCustomers,
              totalProducts: data.totalProducts,
            })
          );
        }, 10000);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchTopProducts = async () => {
      try {
        const response = await fetch("/api/invoice/topselling");
        const data = await response.json();
        const products = data.map(
          (product: {
            id: string;
            productName: string;
            category: string;
            totalRevenue: number;
            totalQuantity: number;
          }) => ({
            name: product.productName,
            sales: `Rs.${product.totalRevenue.toFixed(2)}`,
            quantity: product.totalQuantity,
            category: product.category,
          })
        );
        setTopProducts(products.slice(0, 5));
        
      } catch (error) {
        console.error("Error fetching top products:", error);
      }
    };

    const fetchRecentInvoices = async () => {
      try {
        const response = await fetch("/api/invoice/recentinvoices");
        const data = await response.json();
        const invoices = data.map(
          (invoice: {
            id: string;
            invoiceNumber: string;
            customerDetails: { name: string };
            date: string;
            total: number;
            isPaid: boolean;
            isCancelled: boolean;
          }) => ({
            id: invoice.invoiceNumber,
            customer: invoice.customerDetails.name,
            date: new Date(invoice.date).toLocaleDateString(),
            amount: `Rs.${invoice.total.toFixed(2)}`,
            status: invoice.isPaid,
            isCancelled: invoice.isCancelled,
          })
        );
        setRecentInvoices(invoices);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent invoices:", error);
      }
    };
    fetchRole();
    fetchRecentInvoices();
    fetchStats();
    fetchTopProducts();
  }, []);
    if (loading) {
      return <LoadingPage />;
    }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here is an overview of your business.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg  w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
              <Link
                href="/sales-report"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-slate-800 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200 shadow"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Sales Report
              </Link>
              {role === "admin" && (
                <>
                  <Link
                    href="/newInvoice"
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200 shadow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Customer
                  </button>
                    <button
                    onClick={() => router.push("/admin-requests")}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-slate-800 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200 shadow"
                    >
                    <Users className="w-4 h-4 mr-2" />
                    Admin Requests
                    </button>
                </>
              )}
              <button
                onClick={async () => {
                  await fetch("/api/admin/logout", {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      withCredentials: "true",
                    },
                  });
                  router.push("/");
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
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
                    {presentages.totalSales > 0
                      ? `+${presentages.totalSales}%`
                      : `${presentages.totalSales}%`}
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
                    {presentages.invoicesIssued > 0
                      ? `+${presentages.invoicesIssued}%`
                      : `${presentages.invoicesIssued}%`}
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
                    {presentages.activeCustomers > 0
                      ? `+${presentages.activeCustomers}%`
                      : `${presentages.activeCustomers}%`}
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
                    {presentages.totalProducts > 0
                      ? `+${presentages.totalProducts}%`
                      : `${presentages.totalProducts}%`}
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
                onClick={() => router.push("/top-sold")}
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
                          <span className="text-xs text-gray-500 ml-2">
                            {product.category}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.quantity}{" "} kgs
                          sold
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
