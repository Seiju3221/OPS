import React, { useState, useEffect, useCallback } from 'react';
import { 
  Edit, 
  Clock, 
  Check, 
  Search, 
  ChevronDown, 
  Calendar,
  Eye,
  Loader,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../../redux/features/auth/authApi';
import { useDeleteArticleMutation, useFetchArticlesQuery, useUpdateArticleMutation } from '../../redux/features/articles/articlesApi';
import { toast } from 'react-toastify';

// Message Modal Component
const MessageModal = ({ isOpen, onClose, message, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Delete Article
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{title}"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResubmitButton = ({ articleId, onResubmit, isResubmitting }) => {
  return (
    <button
      onClick={() => onResubmit(articleId)}
      disabled={isResubmitting}
      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isResubmitting ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Check className="w-4 h-4" />
      )}
      <span>Resubmit</span>
    </button>
  );
};

const ArticleItem = ({ article, onEdit, onDelete, onResubmit, isDeleting, isResubmitting }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      case 'revision':
        return 'Needs Revision';
      default:
        return status;
    }
  };

  const getMessageButton = () => {
    if (article.status === 'revision' && article.revisionMessage) {
      return (
        <button
          onClick={() => setShowMessageDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>View Revision Notes</span>
        </button>
      );
    } else if (article.status === 'rejected' && article.rejectionMessage) {
      return (
        <button
          onClick={() => setShowMessageDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>View Rejection Notes</span>
        </button>
      );
    }
    return null;
  };

  const getMessageModalTitle = () => {
    return article.status === 'revision' ? 'Revision Notes' : 'Rejection Notes';
  };

  const getMessage = () => {
    return article.status === 'revision' ? article.revisionMessage : article.rejectionMessage;
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(article.status)}`}>
              {getStatusText(article.status)}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {article.status === 'published' && (
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {article.views || 0} views
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {article.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {article.description}
          </p>
        </div>
        <div className="flex gap-2">
          {getMessageButton()}
          {(article.status === 'revision' || article.status === 'rejected') && (
            <ResubmitButton 
              articleId={article._id}
              onResubmit={onResubmit}
              isResubmitting={isResubmitting}
            />
          )}
          <button
            onClick={() => onEdit(article._id)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete(article._id);
          setShowDeleteDialog(false);
        }}
        title={article.title}
        loading={isDeleting}
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        message={getMessage()}
        title={getMessageModalTitle()}
      />
    </div>
  );
};

const WriterDashboard = () => {
  const [activeTab, setActiveTab] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [query, setQuery] = useState({
    search: '',
    status: 'published',
    sortBy: 'createdAt',
    sortOrder: -1,
    page: 1,
    pageSize: 12
  });
  const navigate = useNavigate();

  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Update query when sort changes
  useEffect(() => {
    setQuery(prev => ({
      ...prev,
      sortBy: sortBy === 'title' ? 'title' : 
              sortBy === 'views' ? 'views' : 'createdAt',
      // For title, use 1 for ascending (A-Z)
      // For dates, use -1 for newest first, 1 for oldest first
      // For views, use -1 for highest first
      sortOrder: sortBy === 'title' ? 1 : 
                sortBy === 'oldest' ? 1 : -1,
      page: 1
    }));
  }, [sortBy]);

  // Add effect to handle search updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(prev => ({
        ...prev,
        search: searchQuery,
        page: 1 // Reset to first page when searching
      }));
    }, 300); // Add small delay to avoid too many API calls while typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
    
    // Get current user to verify writer status
    const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery();

    // Update API call to use pagination params
    const { data: articleData, isLoading: isLoadingArticles, refetch } = useFetchArticlesQuery({
      search: query.search,
      status: activeTab,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize
    }, {
      skip: !currentUser || currentUser.role !== 'writer'
    });

  // Redirect if not a writer
  useEffect(() => {
    if (!isLoadingUser && (!currentUser || currentUser.role !== 'writer')) {
      navigate('/');
    }
  }, [currentUser, isLoadingUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

  useEffect(() => {
    setQuery(prev => ({
      ...prev,
      status: activeTab,
      page: 1
    }));
  }, [activeTab]);

  const handleEdit = (articleId) => {
    navigate(`/update-post/${articleId}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id).unwrap();
      toast.success('Article deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete article');
      console.error("Failed to delete post: ", error);
    }
  };

  const handleResubmit = async (articleId) => {
    if (!articleId) {
      toast.error('Invalid article ID');
      return;
    }

    try {
      await updateArticle({
        id: articleId,
        status: 'pending',
        revisionMessage: '',
        rejectionMessage: ''
      }).unwrap();
      toast.success('Article resubmitted! Wait for admin approval.');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resubmit article');
      console.error("Failed to resubmit article:", error);
    }
  };

  // Update pagination calculations
  const total = articleData?.total || 0; // Get total from API response
  const totalPages = Math.ceil(total / pageSize);

  // Update page change handler
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    setQuery(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update page size change handler
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setQuery(prev => ({
      ...prev,
      page: 1,
      pageSize: newSize
    }));
  }, []);

  // Calculate stats from fetched data
  const getStats = () => {
    if (!articleData?.articles) return { published: 0, pending: 0, rejected: 0, revision: 0 };
    
    return {
      published: articleData.articles.filter(a => a.status === 'published').length || 0,
      pending: articleData.articles.filter(a => a.status === 'pending').length || 0,
      rejected: articleData.articles.filter(a => a.status === 'rejected').length || 0,
      revision: articleData.articles.filter(a => a.status === 'revision').length || 0,
    };
  };

  const stats = getStats();

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Showing {Math.min((currentPage - 1) * pageSize + 1, total)} - {Math.min(currentPage * pageSize, total)} of {total} articles
      </div>
      
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="First page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-1">
          {(() => {
            let pages = [];
            const maxVisible = 5;
            let startPage = Math.max(1, Math.min(currentPage - Math.floor(maxVisible / 2), totalPages - maxVisible + 1));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="start-ellipsis" className="px-2 py-2">
                    •••
                  </span>
                );
              }
            }
            
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium ${
                    currentPage === i 
                      ? 'bg-blue-600 text-white border border-blue-600' 
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i}
                </button>
              );
            }
            
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="end-ellipsis" className="px-2 py-2">
                    •••
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
        </div>
  
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="Last page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
  
      <select
        value={pageSize}
        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
      >
        <option value="12">12 per page</option>
        <option value="24">24 per page</option>
        <option value="48">48 per page</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.published}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revision</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.revision}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Edit2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">My Articles</h1>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveTab('published');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'published'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  setActiveTab('rejected');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'rejected'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => {
                  setActiveTab('revision');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'revision'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Needs Revision
              </button>
            </div>

            {/* Search and Sort */}
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="text-sm text-gray-600">
                    Sort by: {
                      sortBy === 'newest' ? 'Newest First' :
                      sortBy === 'oldest' ? 'Oldest First' :
                      sortBy === 'title' ? 'Title' :
                      'Views'
                    }
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    <button
                      onClick={() => {
                        setSortBy('newest');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        sortBy === 'newest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('oldest');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        sortBy === 'oldest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('title');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        sortBy === 'title' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Title
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Update how articles are displayed */}
          <div className="divide-y divide-gray-100">
            {isLoadingArticles ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : articleData?.articles?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles found</p>
              </div>
            ) : (
              articleData?.articles?.map((article) => (
                <ArticleItem
                key={article._id}
                article={article}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResubmit={handleResubmit} 
                isDeleting={isDeleting}
                isResubmitting={isUpdating}
              />
            ))
          )}
        </div>
      </div>
      {total > 0 && <Pagination />}
    </div>
  );
};

export default WriterDashboard;