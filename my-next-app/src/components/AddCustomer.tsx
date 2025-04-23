import { useState } from "react";
import { X } from "lucide-react";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  epfNumber: string | null;
}

interface AddCustomerProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

const AddCustomer = ({setIsModalOpen}: AddCustomerProps) => {
  const [newCustomer, setNewCustomer] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    epfNumber: null,
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New customer data:", newCustomer);
    
    try {
      // const res = await api.post("/customers/customer", newCustomer);
      // console.log("Customer added:", res.data);
      // setNewCustomer({
      //   name: "",
      //   email: "",
      //   phone: "",
      //   address: "",
      //   epfNumber: null,
      // });
      // setNewCustomer({
      //   name: "",
      //   email: "",
      //   phone: "",
      //   address: "",
      //   epfNumber: "",
      // });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Customer</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAddCustomer}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name*
            </label>
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              name="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              name="phone"
              value={newCustomer.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EPF Number
            </label>
            <input
              type="text"
              name="epfNumber"
              value={newCustomer.epfNumber || ""}
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
              value={newCustomer.address}
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
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
