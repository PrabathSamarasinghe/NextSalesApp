"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, BarChart3, Package, DollarSign, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopSellingProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'totalRevenue',
    direction: 'desc'
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [uniqueCategories, setUniqueCategories] = useState(['all']);
  
  const router = useRouter();

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/invoice/topselling");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const categories = ['all', ...new Set(data.map(product => product.category))];
        setUniqueCategories(categories);
        
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopSellingProducts();
  }, []);

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction === 'desc' ? 'sorted-desc' : 'sorted-asc' : undefined;
  };

  // Calculate totals for summary cards
  const totalSales = products.reduce((sum, product) => sum + product.totalQuantity, 0);
  const totalRevenue = products.reduce((sum, product) => sum + product.totalRevenue, 0);
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Get filtered and sorted products
  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(product => product.category === filterCategory);
    
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Calculate percentage of total for each product (for visualization)
  const maxRevenue = Math.max(...products.map(product => product.totalRevenue));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading top selling products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-7 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Top Selling Products</h1>
        <button
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Kilos Sold</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalSales.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">Rs. {totalRevenue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Value</p>
              <h3 className="text-2xl font-bold text-gray-800">Rs. {avgOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <BarChart3 size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Product Performance</h2>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700 mr-2">
              Filter by Category:
            </label>
            <select
              id="categoryFilter"
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getClassNamesFor('productName')}`}
                  onClick={() => requestSort('productName')}
                >
                  Product Name
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getClassNamesFor('category')}`}
                  onClick={() => requestSort('category')}
                >
                  Category
                </th>
                <th 
                  className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getClassNamesFor('totalQuantity')}`}
                  onClick={() => requestSort('totalQuantity')}
                >
                  Quantity Sold (kg)
                </th>
                <th 
                  className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getClassNamesFor('totalRevenue')}`}
                  onClick={() => requestSort('totalRevenue')}
                >
                  Revenue (Rs.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                    {product.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                     {product.totalRevenue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(product.totalRevenue / maxRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found matching your filter.</p>
          </div>
        )}
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Package size={20} className="text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Category Distribution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Sales Count */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4">Units Sold by Category</h3>
            {uniqueCategories
              .filter(category => category !== 'all')
              .map(category => {
                const categoryProducts = products.filter(product => product.category === category);
                const categorySales = categoryProducts.reduce((sum, product) => sum + product.totalQuantity, 0);
                const percentage = (categorySales / totalSales) * 100;
                
                return (
                  <div key={category} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {categorySales.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Category Revenue */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4">Revenue by Category</h3>
            {uniqueCategories
              .filter(category => category !== 'all')
              .map(category => {
                const categoryProducts = products.filter(product => product.category === category);
                const categoryRevenue = categoryProducts.reduce((sum, product) => sum + product.totalRevenue, 0);
                const percentage = (categoryRevenue / totalRevenue) * 100;
                
                return (
                  <div key={category} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-medium text-gray-700">
                        Rs. {categoryRevenue.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}