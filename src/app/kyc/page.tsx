'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, 
  FaCheckCircle, FaTimesCircle, FaSort, FaSearch, FaEye, FaTimes, FaThumbsUp 
} from 'react-icons/fa';
import { BACKEND_API_URL } from '@/constants/apiConstants';
import Pagination from '@/components/Pagination';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string;
  countryCode?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isDocumentVerified: boolean;
  createdAt: string;
  businessDesc?: string;
  businessType?: string;
  verificationDocUrl?: string;
}

type SortField = 'name' | 'email' | 'role' | 'createdAt' | 'isDocumentVerified';
type SortDirection = 'asc' | 'desc';

export default function KYCPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [approving, setApproving] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;
  
  const { user: currentUser, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, token, router]);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowercasedSearch) ||
        user.email.toLowerCase().includes(lowercasedSearch) ||
        (user.businessType && user.businessType.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    // Apply verification filter
    if (filterVerification !== 'all') {
      const isVerified = filterVerification === 'verified';
      result = result.filter(user => user.isDocumentVerified === isVerified);
    }
    
    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'isDocumentVerified':
          comparison = Number(a.isDocumentVerified) - Number(b.isDocumentVerified);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [users, searchTerm, sortField, sortDirection, filterRole, filterVerification]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return (
      <FaSort 
        className={`ml-1 ${sortDirection === 'asc' ? 'text-green-600' : 'text-red-600'}`} 
      />
    );
  };

  const handleApproveUser = async (userId: string) => {
    if (approving) return; // Prevent multiple approvals at once
    
    setApproving(userId);
    try {
      const response = await fetch(`${BACKEND_API_URL}/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }
      // Update the user's verification status in the local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, isDocumentVerified: true , role: 'SELLER'} : user
      );
      setUsers(updatedUsers);
      
      // If the modal is open and showing this user, update the selected user too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, isDocumentVerified: true });
      }
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Failed to approve user. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#027e3f] mx-auto"></div>
            <h2 className="text-xl font-semibold mt-4 text-gray-700">Loading users...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Verification Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and verify user documents and information
          </p>
        </div>
        
        {/* Filters and Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center justify-between">
            <div className="w-full md:w-1/3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#027e3f] focus:border-[#027e3f] sm:text-sm"
              />
            </div>
            
            <div className="flex flex-wrap justify-end space-x-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-[#027e3f] focus:border-[#027e3f]"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="SELLER">Seller</option>
              </select>
              
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-[#027e3f] focus:border-[#027e3f]"
              >
                <option value="all">All Verifications</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                    <div className="flex items-center">
                      Email {getSortIcon('email')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('role')}>
                    <div className="flex items-center">
                      Role {getSortIcon('role')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('isDocumentVerified')}>
                    <div className="flex items-center">
                      Verification {getSortIcon('isDocumentVerified')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      Joined {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-[#027e3f] flex items-center justify-center text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{user.email}</span>
                          {user.isEmailVerified ? (
                            <FaCheckCircle className="text-green-500 ml-2" title="Email verified" />
                          ) : (
                            <FaTimesCircle className="text-red-500 ml-2" title="Email not verified" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'SELLER' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center text-sm ${
                          user.isDocumentVerified ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {user.isDocumentVerified ? (
                            <>
                              <FaCheckCircle className="mr-1.5" />
                              Verified
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-1.5" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!user.isDocumentVerified && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              disabled={approving === user.id}
                              className={`text-white bg-[#027e3f] hover:bg-[#025e2f] px-3 py-1 rounded-md flex items-center space-x-1 ${
                                approving === user.id ? 'opacity-75 cursor-not-allowed' : ''
                              }`}
                            >
                              <FaThumbsUp className="mr-1" /> 
                              {approving === user.id ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="text-[#027e3f] hover:text-[#025e2f] bg-[#e6f7ef] hover:bg-[#d1f0e0] px-3 py-1 rounded-md flex items-center space-x-1"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found matching the criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
              <div className="text-sm text-gray-500 text-center mt-2">
                Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredUsers.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </div>
            </div>
          )}
        </div>
        
        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="user-details-modal" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div>
                    <div className="bg-[#e6f7ef] px-4 py-5 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-[#027e3f] flex items-center justify-center text-white text-lg font-semibold">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedUser.name}</h3>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedUser.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : selectedUser.role === 'SELLER' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                          <div className="mt-2 grid grid-cols-1 gap-2">
                            <div className="flex items-center text-sm">
                              <FaEnvelope className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{selectedUser.email}</span>
                              {selectedUser.isEmailVerified ? (
                                <FaCheckCircle className="text-green-500 ml-2" title="Email verified" />
                              ) : (
                                <FaTimesCircle className="text-red-500 ml-2" title="Email not verified" />
                              )}
                            </div>
                            
                            {selectedUser.phoneNumber && (
                              <div className="flex items-center text-sm">
                                <FaPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {selectedUser.countryCode} {selectedUser.phoneNumber}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm">
                              <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{selectedUser.address}</span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedUser.role === 'SELLER' && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                            <div className="mt-2 grid grid-cols-1 gap-2">
                              <div className="flex items-center text-sm">
                                <FaBuilding className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{selectedUser.businessType || 'Not specified'}</span>
                              </div>
                              <div className="text-sm text-gray-700 pl-6">
                                {selectedUser.businessDesc || 'No business description provided.'}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Verification Status</h4>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center text-sm">
                              {selectedUser.isDocumentVerified ? (
                                <span className="flex items-center text-green-600">
                                  <FaCheckCircle className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  Document Verified
                                </span>
                              ) : (
                                <span className="flex items-center text-yellow-600">
                                  <FaTimesCircle className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  Verification Pending
                                </span>
                              )}
                            </span>
                            {!selectedUser.isDocumentVerified && (
                              <button
                                onClick={() => handleApproveUser(selectedUser.id)}
                                disabled={approving === selectedUser.id}
                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-[#027e3f] hover:bg-[#025e2f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027e3f] ${
                                  approving === selectedUser.id ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                              >
                                <FaThumbsUp className="mr-1.5" />
                                {approving === selectedUser.id ? 'Approving...' : 'Approve User'}
                              </button>
                            )}
                          </div>
                          {selectedUser.verificationDocUrl && (
                            <div className="mt-2">
                              <a 
                                href={selectedUser.verificationDocUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-[#027e3f] hover:bg-[#025e2f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027e3f]"
                              >
                                View Document
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 border-t pt-4">
                          Joined on {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027e3f] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}