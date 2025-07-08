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
  ArrowUp,
  ArrowDown,
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

        const newStats = {
          totalSales: `Rs.${data.totalRevenue
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          invoicesIssued: data.totalInvoices,
          activeCustomers: data.totalCustomers,
          totalProducts: data.totalProducts,
        };

        setStats(newStats);

        const savedStats = localStorage.getItem("stats");
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);

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

  const renderPercentageChange = (percentage: number) => {
    const isPositive = percentage > 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    const colorClass = isPositive ? "text-emerald-600" : "text-red-500";
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="w-3 h-3 mr-1" />
        <span className="text-xs font-semibold">
          {Math.abs(percentage)}%
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                {`Welcome back! Here's an overview of your business performance.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sales-report"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Sales Report
              </Link>
              
              {role === "admin" && (
                <>
                  <Link
                    href="/newInvoice"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Customer
                  </button>
                  <button
                    onClick={() => router.push("/admin-requests")}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mb-4 w-fit">
                  <DollarSign className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-2 break-all">
                  {stats.totalSales}
                </p>
                {renderPercentageChange(presentages.totalSales)}
              </div>
            </div>
          </div>

          <div
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => router.push("/invoices")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl mb-4 w-fit">
                  <FileText className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  Invoices Issued
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {stats.invoicesIssued}
                </p>
                {renderPercentageChange(presentages.invoicesIssued)}
              </div>
            </div>
          </div>

          <div
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => router.push("/customers")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl mb-4 w-fit">
                  <Users className="text-purple-600 w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  Active Customers
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {stats.activeCustomers}
                </p>
                {renderPercentageChange(presentages.activeCustomers)}
              </div>
            </div>
          </div>

          <div
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => router.push("/products")}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl mb-4 w-fit">
                  <Package className="text-amber-600 w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  Total Products
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {stats.totalProducts}
                </p>
                {renderPercentageChange(presentages.totalProducts)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Invoices
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Latest invoice activity from your business
                  </p>
                </div>
                <button
                  onClick={() => router.push("/invoices")}
                  className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 hover:bg-slate-50 transition-colors duration-200 rounded-xl border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-1">
                          {invoice.customer}
                        </p>
                        <div className="flex items-center text-xs text-slate-500 space-x-2">
                          <span className="bg-slate-100 px-2 py-1 rounded-md">
                            {invoice.id}
                          </span>
                          <span>•</span>
                          <span>{invoice.date}</span>
                          {invoice.isCancelled && (
                            <span className="text-red-500 font-medium bg-red-50 px-2 py-1 rounded-md">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-slate-900">
                          {invoice.amount}
                        </span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                            invoice.status
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.status ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Top Products
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Best performing products this period
                  </p>
                </div>
                <button
                  onClick={() => router.push("/top-sold")}
                  className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-slate-50 transition-colors duration-200 rounded-xl border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 ml-9">
                          {product.quantity} kgs sold
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-slate-900">
                          {product.sales}
                        </span>
                        <div className="p-2 bg-green-50 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <AddCustomer setIsModalOpen={setIsModalOpen} />}
    </div>
  );
}