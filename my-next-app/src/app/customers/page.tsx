"use client";
import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowLeft, ChevronRight, Plus } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';

import AddCustomer from '@/components/AddCustomer';


interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  epfNumber: string;
}

interface Customer extends CustomerDetails {
  _id: string;
  totalSpent: number;
  lastPurchase: string;
  [key: string]: string | number;
}

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useRouter(); // useRouter from next/navigation
  
  // State for new customer form
//   const loadingContext = useContext(LoadingContext);
  
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
        const response = await fetch('/api/customer/all');
        const data = await response.json();
        try{
            const totals = await Promise.all(
                data.map(async (customer: Customer) => {
                    try {
                        const response = await fetch(`/api/invoice/other/${customer._id}`);
                        const data = await response.json();
                        return { ...customer, totalSpent: data.totalSpent, lastPurchase: data.lastPurchaseDate };
                    } catch (err) {
                        console.error(`Error fetching totalSpent for customer ${customer._id}:`, err);
                        return { ...customer, totalSpent: 0, lastPurchase: null }; // Fallback to 0 and null for lastPurchase
                    }
                }));
            setCustomers(totals);
        }
        catch (error) {
            console.error('Error fetching customers:', error);
        }
    }
    //   loadingContext.setLoading(true); // Set loading to true when fetching data
    //   try {
    //     // Fetch all customers
    //     const { data: customerList } = await api.get('/customers/customers');
    
    //     // Fetch totalSpent for each customer in parallel
    //     const totals = await Promise.all(
    //       customerList.map(async (customer: Customer) => {
    //         try {
    //           const { data } = await api.get(`/invoices/additional/${customer._id}`);              
    //           return { ...customer, totalSpent: data.totalSpent, lastPurchase: data.lastPurchaseDate };
    //         } catch (err) {
    //           console.error(`Error fetching totalSpent for customer ${customer._id}:`, err);
    //           return { ...customer, totalSpent: 0, lastPurchase: null }; // Fallback to 0 and null for lastPurchase
    //         }
    //       })
    //     );
    
    //     // Set updated customers with totalSpent included
    //     setCustomers(totals);
    //     loadingContext.setLoading(false); // Set loading to false after fetching data
    //   } catch (error) {
    //     console.error('Error fetching customers:', error);
    //   }
    // };
    fetchCustomers();    
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortField === 'totalSpent') {
        return sortDirection === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
      } else if (sortField === 'lastPurchase') {
        if (!a.lastPurchase) return sortDirection === 'asc' ? -1 : 1;
        if (!b.lastPurchase) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc' 
          ? new Date(a.lastPurchase).getTime() - new Date(b.lastPurchase).getTime()
          : new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime();
      } else {
        // Sort by name or other string fields
        const valueA = (typeof a[sortField] === 'string' ? a[sortField]?.toLowerCase() : String(a[sortField])) || '';
        const valueB = (typeof b[sortField] === 'string' ? b[sortField]?.toLowerCase() : String(b[sortField])) || '';
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
    });

  const viewCustomerDetails = (customerId: string) => {
    navigate.push(`/customerdata/${customerId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
        <button 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          Add Customer
        </button>
      </div>

      <div className="flex items-center mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={() => navigate.push('/dashboard')}
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Dashboard</span>  
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Customer Name
                    {sortField === 'name' && (
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center">
                    Phone
                    {sortField === 'phone' && (
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center">
                    Total Spent
                    {sortField === 'totalSpent' && (
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastPurchase')}
                >
                  <div className="flex items-center">
                    Last Purchase
                    {sortField === 'lastPurchase' && (
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.totalSpent ? `Rs.${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(Number(customer.totalSpent))}` : 'Rs.0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastPurchase ? formatDate(customer.lastPurchase) : 'No purchases'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => viewCustomerDetails(customer._id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                      >
                        View Details
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <AddCustomer 
          setIsModalOpen={setIsModalOpen} 
        />
      )}
    </div>
  );
}