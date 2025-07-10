"use client";
import React, { useEffect, useState } from "react";

const Email = ({
  setEmailOpen,
  productWiseRevenue,
}: {
  setEmailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  productWiseRevenue: Array<{
    id: number;
    name: string;
    kilos: number;
    revenue: number;
  }>;
}) => {
  // State to hold stock data
  const [stockData, setStockData] = useState<
    Array<{
      name: string;
      stock: number;
      category: string;
      price: number;
    }>
  >([]);
  const [isSending, setIsSending] = useState(false);

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch("/api/product/all");
        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
    fetchStockData();
  }, []);

  // Constants and data
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calculations
  const totalSales = productWiseRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalSalesKg = productWiseRevenue.reduce(
    (sum, item) => sum + item.kilos,
    0
  );
  const totalStockAmount = stockData.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const netSalesAverage = Number((totalSales / totalSalesKg).toFixed(2));

  return (
    // <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="space-y-4">
      {/* Professional Header */}
      <div className="bg-slate-900 text-white">
        <div className="px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-light tracking-wide text-white mb-1">
                KAIRO TRADING
              </h1>
              <div className="w-16 h-0.5 bg-blue-400 mb-3"></div>
              <p className="text-slate-300 text-sm font-medium">
                MONTHLY SALES & INVENTORY REPORT
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Report Generated:{" "}
                {currentDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Total Revenue
            </div>
            <div className="text-2xl font-bold text-slate-900">
              Rs. {totalSales.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Total Volume
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {totalSalesKg.toLocaleString()} KG
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Avg. Price/KG
            </div>
            <div className="text-2xl font-bold text-slate-900">
              Rs. {netSalesAverage.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">
              Sales Performance Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Product-wise revenue breakdown for{" "}
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Volume (KG)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Revenue (Rs. )
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Avg. Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {productWiseRevenue.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right font-medium">
                      {item.kilos.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-semibold">
                      Rs. {item.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                      Rs. {(item.revenue / item.kilos).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 text-white">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">TOTAL</td>
                  <td className="px-6 py-4 text-sm font-semibold text-right">
                    {totalSalesKg.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-right">
                    Rs. {totalSales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-right">
                    Rs. {netSalesAverage.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">
              Current Inventory Status
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Stock levels and valuation as of{" "}
              {currentDate.toLocaleDateString()}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Value (Rs. )
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {stockData.map(
                  (item, index) =>
                    item?.stock > 0 && (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {item?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                          {item?.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right font-medium">
                          {item?.stock?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-semibold">
                          Rs. {(item.price * item.stock)?.toLocaleString()}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
              <tfoot className="bg-slate-800 text-white">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold" colSpan={3}>
                    TOTAL INVENTORY VALUE
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-right">
                    Rs. {totalStockAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
                This report is auto-generated and confidential
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setEmailOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors duration-200 text-sm font-medium"
                onClick={async () => {
                  try {
                    setIsSending(true);
                    await fetch("/api/email", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        productWiseRevenue,
                        stockData,
                      }),
                    }).then((response) => {
                      if (!response.ok) {
                        throw new Error("Failed to send email");
                      }
                      setEmailOpen(false);
                      return response.json();
                    });
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={!productWiseRevenue.length || !stockData.length}
              >
                {isSending ? "Sending..." : "Send Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <div>Kairo Trading Pvt. Ltd. • Monthly Business Report</div>
          <div>© {currentDate.getFullYear()} All Rights Reserved</div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default Email;
