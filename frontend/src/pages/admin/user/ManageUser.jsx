import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteUserMutation, useGetUserQuery, useGetCurrentUserQuery } from '../../../redux/features/auth/authApi';
import UpdateUserModal from './UpdateUserModal';
import { AlertCircle, RefreshCw, Search, Filter, UserPlus, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

const ManageUser = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(12);

  const { data, error, isLoading, refetch } = useGetUserQuery(undefined, {
    selectFromResult: ({ data, ...otherProps }) => ({
      ...otherProps,
      data: data || { users: [] }  // Provide a default empty users array
    })
  });

  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  useEffect(() => {
    console.log('Current user data:', currentUser); // Updated to access nested user object
  }, [currentUser]);

  useEffect(() => {
    console.log('Raw user data:', data);
    console.log('Users array:', data?.users || []);
  }, [data]);

  // Updated permission logic for user deletion
  const canDeleteUser = (user) => {
    // Access the nested user object correctly and ensure we're comparing the right IDs
    if (currentUser?.role === 'admin') {
      // Admin can delete other users except themselves
      return user._id !== currentUser._id;
    }
    return false;
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleDelete = async (id) => {
    try {
      await deleteUser(id).unwrap();
      setDeleteConfirmUser(null);
      toast.success('User deleted!');
      await refetch();
    } catch (error) {
      console.error("Failed to delete user!", error);
      toast.error('Failed to delete user!');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Get role badge style
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'writer':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'user':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Sort function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort users
  const filteredAndSortedUsers = React.useMemo(() => {
    const users = data?.users || [];
    
    let filtered = users.filter(user => {
      const searchFields = [
        user.email?.toLowerCase() || '',
        user.username?.toLowerCase() || '',
      ];
      const matchesSearch = searchTerm 
        ? searchFields.some(field => field.includes(searchTerm.toLowerCase()))
        : true;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
  
    return filtered;
  }, [data?.users, searchTerm, filterRole, sortConfig]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const renderPaginationControls = () => {
    return (
      <div className="flex items-center justify-between mt-4 px-6 pb-6">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredAndSortedUsers.length)} 
          {' '}of {filteredAndSortedUsers.length} users
        </div>
        <div className="flex items-center gap-2">
          {/* Page size selector */}
          <select 
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            {[12, 24, 48].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} per page
              </option>
            ))}
          </select>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page number buttons */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-8 h-8 rounded-lg ${
                    currentPage === pageNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Users</h3>
              <p className="text-red-700 text-sm">{error?.data?.message || 'Failed to load users. Please try again later.'}</p>
            </div>
          </div>
        </div>
      )}

    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">User Management</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Comprehensive overview of {filteredAndSortedUsers.length} users
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button 
                  onClick={refetch}
                  className="p-2.5 bg-white hover:bg-gray-100 rounded-full shadow-md transition-all duration-300 ease-in-out"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                </button>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">Add User</span>
                </Link>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by email or username..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="writer">Writer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortConfig.key === 'email' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    Username
                    {sortConfig.key === 'username' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sortConfig.key === 'role' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {currentUsers.map((user, index) => (
                  <tr 
                    key={user?._id} 
                    className="hover:bg-blue-50 transition-colors duration-200 ease-in-out"
                  >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {indexOfFirstUser + index + 1}
                </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.username ? (
                      <span className="font-medium">{user.username}</span>
                    ) : (
                      <span className="text-gray-400 italic">No username</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user?.role)}`}>
                      {user?.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(user)}
                        disabled={!canDeleteUser(user)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1
                          ${canDeleteUser(user)
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          }`}
                        title={
                          user.role === 'admin'
                            ? "Cannot delete admin accounts"
                            : user._id === currentUser?._id
                              ? "Cannot delete your own account"
                              : currentUser?.role !== 'admin'
                                ? "Only admins can delete users"
                                : "Delete user"
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                {filteredAndSortedUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center space-y-3">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                        <p className="text-lg font-medium">
                          {searchTerm
                            ? `No users found matching "${searchTerm}"`
                            : filterRole !== 'all'
                              ? `No users found with role "${filterRole}"`
                              : 'No users exist yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>

          {/* Update Modal */}
          {isModalOpen && (
            <UpdateUserModal
              onClose={handleCloseModal}
              user={selectedUser}
              onRoleUpdate={refetch}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmUser && canDeleteUser(deleteConfirmUser) && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete the user <span className="font-medium text-gray-900">{deleteConfirmUser.email}</span>? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirmUser(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmUser._id)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUser;