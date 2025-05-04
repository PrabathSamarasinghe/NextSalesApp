"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowLeft,
  Eye,
  MoreVertical,
} from "lucide-react";

import { useRouter } from "next/navigation"; // Updated import for Next.js 13+

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isVerified: boolean;
  role: "admin" | "viewer";
  createdAt: string;
  updatedAt: string;
}

const AdminUserManagement: React.FC = () => {
  const navigate = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "viewer">(
    "viewer"
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AdminUser;
    direction: "asc" | "desc";
  } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/all");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, roleFilter, searchTerm, sortConfig]);

  const handleVerificationChange = async (
    userId: string,
    newValue: boolean
  ) => {
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isVerified: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isVerified: newValue } : user
        )
      );

      showNotification(
        `User verification ${newValue ? "approved" : "revoked"}`,
        "success"
      );
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Failed to update status",
        "error"
      );
    }
  };

  const handleBulkVerification = async (verify: boolean) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          isVerified: verify,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${verify ? "verify" : "unverify"} users`);
      }

      // Update local state
      setUsers(
        users.map((user) =>
          selectedUsers.includes(user._id)
            ? { ...user, isVerified: verify }
            : user
        )
      );

      setSelectedUsers([]);
      showNotification(
        `${selectedUsers.length} users ${verify ? "verified" : "unverified"}`,
        "success"
      );
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Bulk operation failed",
        "error"
      );
    }
  };

  const requestSort = (key: keyof AdminUser) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleExpandUser = (userId: string) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin h-16 w-16 text-indigo-600" />
          <p className="mt-4 text-indigo-700 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 mb-2">User Management</h1>
            <p className="text-gray-500">Manage and monitor user accounts</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <button
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mr-6"
              onClick={() => navigate.push("/dashboard")}
            >
              <ArrowLeft size={20} className="mr-2" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200"
            >
              <RefreshCw className="h-5 w-5 text-indigo-600" />
              <span className="text-indigo-700">Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 border border-gray-100">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-indigo-400" />
                  </div>
                  <select
                    className="pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(
                        e.target.value as "all" | "admin" | "viewer"
                      )
                    }
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="viewer">Viewers</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center">
                <span className="text-sm font-medium text-indigo-800">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkVerification(true)}
                  className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200 transition-colors duration-200 flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Verify
                </button>
                <button
                  onClick={() => handleBulkVerification(false)}
                  className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200 transition-colors duration-200 flex items-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Unverify
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("firstName")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig?.key === "firstName" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4 text-indigo-500" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 text-indigo-500" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {sortConfig?.key === "role" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4 text-indigo-500" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 text-indigo-500" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("isVerified")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig?.key === "isVerified" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4 text-indigo-500" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 text-indigo-500" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        No users found
                        {searchTerm && (
                          <p className="mt-1 text-gray-400">
                            Try adjusting your search or filters
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleSelectUser(user._id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200">
                              <span className="text-indigo-600 font-medium">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-indigo-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <span className="flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                Viewer
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isVerified
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleVerificationChange(
                                  user._id,
                                  !user.isVerified
                                )
                              }
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                user.isVerified
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                              }`}
                            >
                              {user.isVerified ? "Revoke" : "Verify"}
                            </button>
                            <button
                              onClick={() => toggleExpandUser(user._id)}
                              className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedUser === user._id && (
                        <tr className="bg-indigo-50 animate-fadeIn">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <div>
                                <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
                                  <div className="w-1 h-5 bg-indigo-500 rounded mr-2"></div>
                                  User Details
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-md space-y-2 border border-gray-100">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">
                                      Full Name:
                                    </span>{" "}
                                    <span className="text-gray-900">{user.firstName} {user.lastName}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">
                                      Username:
                                    </span>{" "}
                                    <span className="text-indigo-600">@{user.username}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">Email:</span>{" "}
                                    <span className="text-gray-900">{user.email}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
                                  <div className="w-1 h-5 bg-indigo-500 rounded mr-2"></div>
                                  Account Information
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-md space-y-2 border border-gray-100">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">Role:</span>{" "}
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-md ${
                                        user.role === "admin"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">Status:</span>{" "}
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-md ${
                                        user.isVerified
                                          ? "bg-green-100 text-green-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {user.isVerified
                                        ? "Verified"
                                        : "Pending Verification"}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">
                                      Created:
                                    </span>{" "}
                                    <span className="text-gray-900">{new Date(
                                      user.createdAt
                                    ).toLocaleDateString()}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700">
                                      Last Updated:
                                    </span>{" "}
                                    <span className="text-gray-900">{new Date(
                                      user.updatedAt
                                    ).toLocaleDateString()}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 p-2">
          <div>
            Showing <span className="font-medium text-indigo-700">{filteredUsers.length}</span> of <span className="font-medium text-indigo-700">{users.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            {roleFilter !== "all" && (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
                Filter: {roleFilter}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
                Search: {searchTerm}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdminUserManagement;