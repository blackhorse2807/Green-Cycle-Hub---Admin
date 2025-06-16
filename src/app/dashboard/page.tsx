'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BACKEND_API_URL } from '@/constants/apiConstants';
import { 
  Users, ShoppingBag, AlertCircle, CheckCircle, 
  TrendingUp, Activity, DollarSign, Package
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  pendingVerifications: number;
  activeUsers: number;
  recentTransactions: number;
  totalRevenue: number;
  verifiedSellers: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  category: string;
  description: string;
  additionalNotes?: string;
  isApproved: boolean;
  createdAt: string;
  sellerUserId: string;
  images: Array<{
    id: number;
    url: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: 'USER_JOINED' | 'SELLER_VERIFIED' | 'PRODUCT_ADDED' | 'VERIFICATION_REQUESTED';
  message: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingVerifications: 0,
    activeUsers: 0,
    recentTransactions: 0,
    totalRevenue: 0,
    verifiedSellers: 0
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch users data
        const usersResponse = await fetch(`${BACKEND_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch products data
        const productsResponse = await fetch(`${BACKEND_API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (usersResponse.ok && productsResponse.ok) {
          const usersData = await usersResponse.json();
          const productsData = await productsResponse.json();
          const users = usersData.users;
          const products = productsData;

          // Calculate stats from users data
          const sellers = users.filter((u: any) => u.role === 'SELLER');
          const verifiedSellers = sellers.filter((s: any) => s.isDocumentVerified);
          const pendingVerifications = sellers.length - verifiedSellers.length;

          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            totalSellers: sellers.length,
            totalProducts: products.length,
            pendingVerifications,
            verifiedSellers: verifiedSellers.length,
            activeUsers: users.filter((u: any) => u.isEmailVerified).length
          }));

          setProducts(products);

          // Generate recent activity from both users and products
          const userActivity = users
            .slice(0, 3)
            .map((u: any) => ({
              id: u.id,
              type: 'USER_JOINED',
              message: `New user ${u.name} joined the platform`,
              timestamp: u.createdAt
            }));

          const productActivity = products
            .slice(0, 3)
            .map((p: Product) => ({
              id: p.id.toString(),
              type: 'PRODUCT_ADDED',
              message: `New product "${p.name}" was added`,
              timestamp: p.createdAt
            }));

          setRecentActivity([...userActivity, ...productActivity]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
          );
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of platform statistics and recent activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Products
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalProducts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Verifications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pendingVerifications}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Sellers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Verified Sellers
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.verifiedSellers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Products</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {products.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-[#027e3f] truncate">
                          {product.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.isApproved ? 'Approved' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-gray-500">
                          {product.price} {product.currency}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Package className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {product.quantity} {product.unit}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <ShoppingBag className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {product.category}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Added {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 bg-white shadow rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'USER_JOINED' && (
                        <Users className="h-6 w-6 text-blue-500" />
                      )}
                      {activity.type === 'SELLER_VERIFIED' && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                      {activity.type === 'PRODUCT_ADDED' && (
                        <Package className="h-6 w-6 text-purple-500" />
                      )}
                      {activity.type === 'VERIFICATION_REQUESTED' && (
                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 