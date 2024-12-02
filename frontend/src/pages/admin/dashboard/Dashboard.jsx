import React, { useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { FiUsers, FiTrendingUp, FiActivity } from "react-icons/fi";
import { FaComments } from "react-icons/fa";
import { GrArticle } from "react-icons/gr";
import { RiAdminLine } from "react-icons/ri";
import { useFetchArticlesQuery } from '../../../redux/features/articles/articlesApi';
import { useGetCommentsQuery } from '../../../redux/features/comments/commentApi';
import { useGetUserQuery } from '../../../redux/features/auth/authApi';
import PostsChart from './PostsChart';

const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex space-x-3">
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded-lg mb-2" />
                <div className="h-6 w-16 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded-lg" />
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-8 w-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full bg-gray-200 rounded-lg" />
        </div>

        {/* Recent Activity Section Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded-lg mb-2" />
                    <div className="h-3 w-20 bg-gray-200 rounded-lg" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
          <div className="h-4 w-full bg-gray-200 rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition-all duration-200"
  >
    <Icon className="w-4 h-4 text-gray-600" />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

const StatCard = ({ stat }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
    <div className="flex items-center space-x-3">
      <div className={`${stat.iconBg} p-2 rounded-lg`}>
        {stat.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{stat.title}</p>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
          {stat.change !== undefined && (
            <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stat.change >= 0 ? '+' : ''}{stat.change}%
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, time, type, status }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 rounded-full ${
        status === 'completed' ? 'bg-green-400' : 
        status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'
      }`} />
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
    <span className={`text-xs px-2 py-1 rounded-full ${
      type === 'article' ? 'bg-blue-100 text-blue-700' :
      type === 'comment' ? 'bg-purple-100 text-purple-700' :
      'bg-gray-100 text-gray-700'
    }`}>
      {type}
    </span>
  </div>
);

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
  >
    {children}
  </button>
);

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { user } = useSelector((state) => state.auth);
  const { data: articlesData = { articles: [], total: 0 }, error: articlesError, isLoading } = useFetchArticlesQuery({
    ...query,
    status: 'published',
    page: 1,
    pageSize: 100
  });

  const { data: commentsData = { totalComment: 0 }, error: commentsError } = useGetCommentsQuery();
  const { data: usersData = { users: [] }, error: usersError } = useGetUserQuery();

  const adminCount = useMemo(() => 
    usersData.users?.filter(user => user.role === 'admin').length || 0,
    [usersData.users]
  );

  const stats = useMemo(() => [
    {
      title: 'Total Users',
      value: usersData.users?.length || 0,
      icon: <FiUsers className="w-4 h-4 text-blue-600" />,
      iconBg: 'bg-blue-50',
      change: 12.5
    },
    {
      title: 'Total Posts',
      value: articlesData.total || 0,
      icon: <GrArticle className="w-4 h-4 text-rose-600" />,
      iconBg: 'bg-rose-50',
      change: -2.3
    },
    {
      title: 'Active Admins',
      value: adminCount,
      icon: <RiAdminLine className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      change: 0
    },
    {
      title: 'Comments',
      value: commentsData.totalComment,
      icon: <FaComments className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-50',
      change: 8.7
    }
  ], [usersData.users?.length, articlesData.total, adminCount, commentsData.totalComment]);

  if (isLoading) {
    {DashboardSkeleton}
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}
          </h1>
          <p className="text-gray-500 text-sm">
            Here's what's happening with your platform today
          </p>
        </div>
        <div className="flex space-x-3">
          <QuickActionButton 
            icon={FiTrendingUp} 
            label="View Analytics" 
            onClick={() => {}} 
          />
          <QuickActionButton 
            icon={FiActivity} 
            label="Recent Activity" 
            onClick={() => {}} 
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Posts Analytics</h2>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <FilterButton 
                active={timeFilter === 'all'} 
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </FilterButton>
              <FilterButton 
                active={timeFilter === 'month'} 
                onClick={() => setTimeFilter('month')}
              >
                Month
              </FilterButton>
              <FilterButton 
                active={timeFilter === 'week'} 
                onClick={() => setTimeFilter('week')}
              >
                Week
              </FilterButton>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <PostsChart articles={articlesData.articles || []} timeFilter={timeFilter} />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-1">
            <ActivityItem
              title="New article published"
              time="2 hours ago"
              type="article"
              status="completed"
            />
            <ActivityItem
              title="Comment received"
              time="4 hours ago"
              type="comment"
              status="pending"
            />
            <ActivityItem
              title="User registration"
              time="6 hours ago"
              type="user"
              status="completed"
            />
            <ActivityItem
              title="Article updated"
              time="8 hours ago"
              type="article"
              status="completed"
            />
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;