import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CustomerDetails {
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  epfNumber: string | null;
}

interface UpdateCustomerProps {
  setIsModalOpen: (isOpen: boolean) => void;
  customerId: string;
}

const UpdateCustomer = ({ setIsModalOpen, customerId }: UpdateCustomerProps) => {
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    email: null,
    phone: null,
    address: "",
    epfNumber: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/customer/getcustomer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }
        
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Failed to load customer data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (customerId) {
      getCustomer();
    }
  }, [customerId]);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Customer Data:", customer);
    
    try {
      const response = await fetch("/api/customer/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId, customerData: customer }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update customer");
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Failed to update customer");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value === "" ? null : value
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <p className="text-center">Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <p className="text-center text-red-500">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Update Customer</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleUpdateCustomer}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name*
            </label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={customer.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={customer.phone || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EPF Number
            </label>
            <input
              type="text"
              name="epfNumber"
              value={customer.epfNumber || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={customer.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCustomer;