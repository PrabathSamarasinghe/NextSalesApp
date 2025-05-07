"use client";
import { useState, useLayoutEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontSize={14}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={2}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={12}
      >
        {`${payload.name}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#666"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export default function ProductSalesReport() {
  const [activeRevenue, setActiveRevenue] = useState(0);
  const [activeQuantity, setActiveQuantity] = useState(0);
  const router = useRouter();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDateFields, setShowCustomDateFields] = useState(false);

  const [productWiseRevenue, setProductWiseRevenue] = useState([]);
  const [activeMonths, setActiveMonths] = useState();
  const [role, setRole] = useState("");

  useLayoutEffect(() => {
    fetchSalesData();
    fetchRole();
    fetchActiveMonths();
  }, [timeFrame, customStartDate, customEndDate]);

  const fetchRole = async () => {
    try {
      const response = await fetch("/api/admin/auth");
      const data = await response.json();
      setRole(data.decoded.role);
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };
  

  const fetchActiveMonths = async () => {
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const params = new URLSearchParams();

      if (timeFrame === "custom" && customStartDate && customEndDate) {
        params.append("startDate", customStartDate);
        params.append("endDate", customEndDate);
      } else {
        params.append("timeFrame", timeFrame);
      }

      const response = await fetch(
        `/api/invoice/working-months?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();      
      setActiveMonths(data.activeMonths);
      setError("");

    } catch (error) {
      console.error("Error fetching active months:", error);
    }
  }
  const fetchSalesData = async () => {
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const params = new URLSearchParams();

      if (timeFrame === "custom" && customStartDate && customEndDate) {
        params.append("startDate", customStartDate);
        params.append("endDate", customEndDate);
      } else {
        params.append("timeFrame", timeFrame);
      }

      const response = await fetch(
        `/api/invoice/salesreport?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSalesData(data.data);

      const revenueMap = {};

      data.data.forEach((item) => {
        const productName = item.productName;

        if (revenueMap[productName]) {
          revenueMap[productName].kilos += item.totalQuantity;
          revenueMap[productName].revenue += item.totalRevenue;
        } else {
          revenueMap[productName] = {
            id: Object.keys(revenueMap).length + 1,
            name: item.productName,
            kilos: item.totalQuantity,
            revenue: item.totalRevenue,
          };
        }
      });

      setProductWiseRevenue(Object.values(revenueMap));

      setError("");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError("Failed to load sales data. Please try again.");
      setLoading(false);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const getDateRange = () => {
    const today = new Date();

    switch (timeFrame) {
      case "today":
        return today.toLocaleDateString();
      case "thisWeek":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        return `${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`;
      case "thisYear":
        return `Jan 1, ${today.getFullYear()} - Dec 31, ${today.getFullYear()}`;
      case "custom":
        if (customStartDate && customEndDate) {
          return `${new Date(
            customStartDate
          ).toLocaleDateString()} - ${new Date(
            customEndDate
          ).toLocaleDateString()}`;
        }
        return "Select dates";
      default:
        return "";
    }
  };

  const getBarLabel = (item) => {
    return `${item.productName} (${item.category})`;
  };

  const getTotalStats = () => {
    if (!Array.isArray(salesData) || salesData.length === 0) {
      return { totalRevenue: 0, totalQuantity: 0, totalInvoices: 0 };
    }
    return salesData.reduce(
      (totals, item) => ({
        totalRevenue: totals.totalRevenue + item.totalRevenue,
        totalQuantity: totals.totalQuantity + item.totalQuantity,
        totalInvoices: totals.totalInvoices + item.totalInvoices,
      }),
      { totalRevenue: 0, totalQuantity: 0, totalInvoices: 0 }
    );
  };

  const commissionDust2 = (productWiseRevenue) => {
    const baseCommission = 50000; // Base commission for Dust 2
    const dust2Product = productWiseRevenue.find(
      (product) => product.name.toLowerCase() === "dust 2"
    );
    if (dust2Product) {
      return baseCommission * activeMonths;
    }
    return 0;
  };

  const commissionCalculator = (productWiseRevenue) => {
    return productWiseRevenue.reduce((total, product) => {
      if (product.name.toLowerCase() === "dust 2") {
        const baseCommission = 50000; 
        return total + baseCommission * activeMonths;
        }
        return total + (product.revenue * 0.05);
      }, 0
    );
  };
  const { totalRevenue, totalQuantity, totalInvoices } = getTotalStats();
  const totalCommission = commissionCalculator(productWiseRevenue);
  const dust2Commission = commissionDust2(productWiseRevenue);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Product Sales Report
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{getDateRange()}</span>
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={timeFrame}
                    onChange={(e) => {
                      setTimeFrame(e.target.value);
                      setShowCustomDateFields(e.target.value === "custom");
                    }}
                  >
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="thisYear">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {showCustomDateFields && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-blue-600">
                      Total Revenue
                    </h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package size={24} className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-green-600">
                      Total Kilos Sold
                    </h3>
                    <p className="text-2xl font-bold text-green-900">
                      {Number(totalQuantity).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                      })}{" "}
                      kg
                    </p>
                  </div>
                </div>
              </div>
              {role !== "admin" && (
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-purple-600">
                        Total Invoices
                      </h3>
                      <p className="text-2xl font-bold text-purple-900">
                        {totalInvoices}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {role === "admin" && (
                <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
                      <DollarSign size={24} className="text-amber-600" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-amber-600 mb-1">
                        My Commission
                      </h3>
                      <p
                        className="text-2xl font-bold text-amber-900 truncate"
                        title={formatCurrency(totalCommission)}
                      >
                        {formatCurrency(totalCommission)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Revenue by Product
              </h3>
              <div className="h-96 bg-white p-4 rounded-lg border border-gray-200">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    {error}
                  </div>
                ) : salesData.length > 0 ? (
                  // Inside your ProductSalesReport component, replace the existing BarChart section with this:

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey={(item) => getBarLabel(item)}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded shadow border border-gray-200">
                                <p className="font-medium">
                                  {data.productName}
                                </p>
                                <p className="text-gray-600">
                                  Category: {data.category}
                                </p>
                                <p className="text-blue-600 font-medium">
                                  Revenue: {formatCurrency(data.totalRevenue)}
                                </p>
                                <p className="text-gray-600">
                                  Quantity: {data.totalQuantity}
                                </p>
                                <p className="text-gray-600">
                                  Invoices: {data.totalInvoices}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        contentStyle={{
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="totalRevenue"
                        fill="#3b82f6"
                        name="Revenue"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No sales data available for the selected period
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Table */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Detailed Sales Data
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 ">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold (kg)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue (LKR)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoices
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : salesData.length > 0 ? (
                      salesData.map((product) => (
                        <tr
                          key={product.productId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {product.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {product.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(product.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {product.totalInvoices}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(
                              product.totalRevenue /
                                (product.totalQuantity > 1
                                  ? product.totalQuantity
                                  : product.totalQuantity * 1000)
                            )}
                            {product.totalQuantity > 1 ? "/kg" : "/g"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No sales data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {salesData.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                          {/* {totalQuantity} */}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatCurrency(totalRevenue)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {totalInvoices}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatCurrency(totalRevenue / totalQuantity)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Summary
              </h3>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    Revenue Distribution
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeRevenue}
                          activeShape={renderActiveShape}
                          data={productWiseRevenue}
                          dataKey="revenue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          onMouseEnter={(_, index) => setActiveRevenue(index)}
                        >
                          {productWiseRevenue.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 45}, 70%, 50%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    Quantity Distribution
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeQuantity}
                          activeShape={renderActiveShape}
                          data={productWiseRevenue}
                          dataKey="kilos"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          onMouseEnter={(_, index) => setActiveQuantity(index)}
                        >
                          {productWiseRevenue.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 45 + 120}, 70%, 50%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value} kg`}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 ">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold (kg)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue (LKR)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Price (LKR/kg)
                      </th>
                      {role === "admin" && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commissions (LKR)
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : productWiseRevenue.length > 0 ? (
                      productWiseRevenue.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {Number(product.kilos).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(
                              product.revenue /
                                (product.kilos > 1
                                  ? product.kilos
                                  : product.kilos * 1000)
                            )}
                          </td>
                          {role === "admin" && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {formatCurrency(
                                product.name.toLowerCase() === "dust 2"
                                  ? Number(dust2Commission)
                                  : Number(product.revenue) * 0.05
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No sales data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {productWiseRevenue.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                          {/* {totalQuantity} */}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatCurrency(totalRevenue)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900"></td>
                        {role === "admin" && (
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(totalCommission)}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
