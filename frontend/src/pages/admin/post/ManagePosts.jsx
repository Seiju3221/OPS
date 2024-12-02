import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteArticleMutation, useFetchArticlesQuery, useReviewArticleMutation, useUpdateArticleMutation } from '../../../redux/features/articles/articlesApi';
import { formatDate } from '../../../utils/formatDate';
import { MdModeEdit, MdDelete, MdSearch, MdFilterList, MdRefresh, MdAdd, MdCheckCircle, MdCancel, MdVisibility, MdCopyAll, MdArrowDropDown } from "react-icons/md";
import { checkPlagiarism } from "../../../services/plagiarismService.js";
import { toast } from 'react-toastify';

const RichTextRenderer = ({ content }) => {
  const { blocks } = JSON.parse(content);

  return (
    <div className="prose max-w-none">
      {blocks.map((block, index) => (
        <div key={index}>
          {block.type === 'paragraph' && <p>{block.data.text}</p>}
          {/* Add more block type handling as needed */}
        </div>
      ))}
    </div>
  );
};

const sortOptions = [
  { id: 'newest', label: 'Newest First', sortBy: 'createdAt', order: -1 },
  { id: 'oldest', label: 'Oldest First', sortBy: 'createdAt', order: 1 },
];

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-3 py-1">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 rounded-lg border ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6 mb-8">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        {renderPageButtons()}
      </div>
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

const ManagePost = () => {
  const [activeTab, setActiveTab] = useState('published');
  const [query, setQuery] = useState({ search: '', college: '', category: '', status: 'published' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [sort, setSort] = useState('newest');
  const [year, setYear] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  
  const { data: response = { articles: [], total: 0 }, error, isLoading, refetch } = useFetchArticlesQuery({
    search: query.search,
    college: query.college,
    category: query.category,
    status: query.status,
    sortBy: sortOptions.find(option => option.id === sort)?.sortBy || 'createdAt',
    sortOrder: sortOptions.find(option => option.id === sort)?.order || -1,
    page: currentPage,
    limit: postsPerPage
  });

  const [ reviewArticle ] = useReviewArticleMutation();

  const { articles, total } = response;

  // Filter articles by year after fetching
  const filteredArticles = articles?.filter(article => {
    if (!year) return true; // If no year is selected, show all articles
    const articleYear = new Date(article.createdAt).getFullYear();
    return articleYear === parseInt(year);
  });

  // Update the total count based on filtered articles
  useEffect(() => {
    if (filteredArticles) {
      setTotalPages(Math.ceil(filteredArticles.length / postsPerPage));
    }
  }, [filteredArticles?.length, postsPerPage]);

  // Calculate total pages whenever total changes
  useEffect(() => {
    setTotalPages(Math.ceil(total / postsPerPage));
  }, [total, postsPerPage]);

  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  useEffect(() => {
    refetch();
  }, [currentPage, sort, year, query.search, query.college, query.category, query.status]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if click is outside the dropdown
      if (isSortOpen && !event.target.closest('.sort-dropdown')) {
        setIsSortOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // Simplified sort handling
  const handleSortOptionClick = (sortId) => {
    console.log('Sort option clicked:', sortId); // Debug log
    setSort(sortId);
    setIsSortOpen(false);
    setCurrentPage(1);
    refetch();
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleCollegeFilter = (e) => {
    const { value } = e.target;
    setQuery(prev => ({ ...prev, college: value }));
  };

  const handleCategoryFilter = (e) => {
    const { value } = e.target;
    setQuery(prev => ({ ...prev, category: value }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setQuery(prev => ({ ...prev, status: tab }));
  };

  const FilterSection = () => {
    const [searchValue, setSearchValue] = useState('');
    const searchTimeoutRef = useRef(null);

    const clearFilters = () => {
      setSearchValue('');
      setQuery(prev => ({ ...prev, search: '', college: '', category: '' }));
      setYear('');
    };

    useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (!query.search) {
        setSearchValue('');
      }
    }, [query.search]);

    const handleSearch = (e) => {
      const { value } = e.target;
      setSearchValue(value);
      
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
  
      // Set a new timeout to update the query
      searchTimeoutRef.current = setTimeout(() => {
        setQuery(prev => ({ ...prev, search: value }));
      }, 1000);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.relative')) {
          setIsSortOpen(false);
        }
      };
    
      if (isSortOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
    
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isSortOpen]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchValue}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* College Filter */}
        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <select
            value={query.college}
            onChange={handleCollegeFilter}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 appearance-none cursor-pointer"
          >
            <option value="">All Colleges</option>
            <option value="OU">OU</option>
            <option value="ETEEAP">ETEEAP</option>
            <option value="CCIT">CCIT</option>
            <option value="CHS">CHS</option>
            <option value="CAS">CAS</option>
            <option value="CBAA">CBAA</option>
            <option value="COE">COE</option>
            <option value="CCJE">CCJE</option>
            <option value="CTE">CTE</option>
            <option value="CPA">CPA</option>
            <option value="CSW">CSW</option>
            <option value="CHTM">CHTM</option>
            <option value="COA">COA</option>
            <option value="CFAD">CFAD</option>
            <option value="CON">CON</option>
            <option value="CTECH">CTECH</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <select
            value={query.category}
            onChange={handleCategoryFilter}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Extension">Extension</option>
            <option value="Introduction">Introduction</option>
            <option value="Production">Production</option>
            <option value="Training">Training</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <select
            value={year}
            onChange={handleYearChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 appearance-none cursor-pointer"
          >
            <option value="">All Years</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          {(query.search || query.college || query.category || year) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              Clear Filters
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {[query.search, query.college, query.category, year].filter(Boolean).length}
              </span>
            </button>
          )}
        </div>

        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <MdArrowDropDown className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {sortOptions.find(option => option.id === sort)?.label || 'Sort by'}
            </span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSortOptionClick(option.id);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors
                    ${sort === option.id ? 'bg-gray-50 text-blue-600' : 'text-gray-700'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  const TableHeader = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Manage Posts
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredArticles?.length || 0} posts
            </span>
          </h1>
          {total > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {(currentPage - 1) * postsPerPage + 1} to {Math.min(currentPage * postsPerPage, total)} of {total} posts
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={refetch}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdRefresh className="text-xl" />
          </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => handleTabChange('published')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'published'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Published Posts
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white">
            {articles?.filter(a => a.status === 'published').length || 0}
          </span>
        </button>
        <button
          onClick={() => handleTabChange('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Pending Approval
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white">
            {articles?.filter(a => a.status === 'pending').length || 0}
          </span>
        </button>
      </div>
    </div>
  );

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id).unwrap();
      setDeleteConfirm(null);
      toast.success('Article deleted!');
      refetch();
    } catch (error) {
      console.error("Failed to delete post: ", error);
      toast.error('Failed to delete post!');
    }
  };

  const handleApprove = async (article) => {
    try {
      await updateArticle({
        id: article._id,
        // Remove the data wrapper
        ...article,
        status: 'published'
      }).unwrap();
      toast.success('Article approved!');
      refetch();
      setSelectedPost(null); // Close the modal
    } catch (error) {
      console.error("Failed to approve post: ", error);
      toast.error('Failed to approve post!');
    }
  };

  const handleRevision = async (article) => {
    const revisionReason = document.getElementById('revisionReason')?.value;
    if (!revisionReason?.trim()) {
      toast.error('Please provide a reason for revision');
      return;
    }
  
    try {
      if (!article?._id) {
        console.error('Article ID is missing');
        toast.error('Error: Article ID is missing');
        return;
      }
  
      // Ensure the payload matches the backend expectations exactly
      const payload = {
        id: article._id, // Make sure this is a string
        status: 'revision',
        revisionMessage: revisionReason.trim(),
        rejectionMessage: '' // Include empty string as required by backend
      };
  
      console.log('Sending revision request:', payload);
  
      // Call the mutation
      const result = await reviewArticle(payload).unwrap();
      
      console.log('Revision response:', result);
      
      // Only close forms and refetch if successful
      document.getElementById('revisionForm').classList.add('hidden');
      toast.success('Request success!');
      await refetch();
      setSelectedPost(null);
  
    } catch (error) {
      console.error("Review article error:", {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.message
      });
  
      // Handle specific error cases
      if (error.status === 404) {
        toast.error('Article not found. It may have been deleted or moved.');
      } else if (error.status === 'PARSING_ERROR') {
        toast.error('There was an error processing the response. Please try again.');
      } else if (error.data?.message) {
        toast.error(`Error: ${error.data.message}`);
      } else {
        toast.error('Failed to submit revision request. Please try again.');
      }
    }
  };
  
  // Similarly update the handleReject function:
  const handleReject = async (article) => {
    const rejectionReason = document.getElementById('rejectionReason')?.value;
    if (!rejectionReason?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
  
    try {
      if (!article?._id) {
        console.error('Article ID is missing');
        toast.error('Error: Article ID is missing');
        return;
      }
  
      const result = await reviewArticle({
        id: article._id,
        status: 'rejected',
        rejectionMessage: rejectionReason,
        revisionMessage: '' // Add empty string for completeness
      }).unwrap();
      
      console.log('Rejection result:', result);

      toast.success('Article Rejected!');
      await refetch();
      setSelectedPost(null);
      document.getElementById('rejectForm').classList.add('hidden');
    } catch (error) {
      console.error("Failed to reject post:", error);
      
      if (error.status === 'PARSING_ERROR') {
        toast.error('Server error: Unable to process the response. Please try again.');
      } else if (error.status === 404) {
        toast.error('Article not found. It may have been deleted or moved.');
      } else if (error.data?.message) {
        toast.error(`Error: ${error.data.message}`);
      } else {
        toast.error('Failed to reject article. Please try again later.');
      }
    }
  };

  const renderSelectedPostModal = () => {
    if (!selectedPost) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
          {/* Header section */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedPost.title}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {selectedPost.author?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span>Submitted by {selectedPost.author?.username || 'Unknown User'}</span>
                <span>•</span>
                <span>Category: {selectedPost.category}</span>
                <span>•</span>
                <span>{formatDate(selectedPost.createdAt)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          {selectedPost.coverImg && (
            <img
              src={selectedPost.coverImg}
              alt={selectedPost.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          {/* Content section */}
          <div className="mt-4">
            <RichTextRenderer content={selectedPost.content} />
          </div>

          {/* Action buttons section */}
          <div className="mt-6 border-t pt-4">
            <div className="flex gap-4">
              {/* Plagiarism check button */}
              <button
                onClick={() => handlePlagiarismCheck(selectedPost)}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <MdCopyAll className="text-lg" />
                Check Plagiarism
              </button>

              {/* Revision button */}
              <button
                onClick={() => {
                  document.getElementById('revisionForm').classList.remove('hidden');
                  document.getElementById('rejectForm').classList.add('hidden');
                }}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <MdModeEdit className="text-lg" />
                Request Revision
              </button>

              {/* Reject button */}
              <button
                onClick={() => {
                  document.getElementById('rejectForm').classList.remove('hidden');
                  document.getElementById('revisionForm').classList.add('hidden');
                }}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <MdCancel className="text-lg" />
                Reject
              </button>
            </div>

            {/* Revision form */}
            <div id="revisionForm" className="hidden mt-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Revision Request Details</h4>
                <textarea
                  id="revisionReason"
                  className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 resize-none"
                  rows="4"
                  placeholder="Please provide detailed feedback for the writer about what needs to be revised..."
                ></textarea>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => document.getElementById('revisionForm').classList.add('hidden')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRevision(selectedPost)}
                    className="px-4 py-2 text-sm text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                  >
                    Submit Revision Request
                  </button>
                </div>
              </div>
            </div>

            {/* Reject form */}
            <div id="rejectForm" className="hidden mt-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Details</h4>
                <textarea
                  id="rejectionReason"
                  className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
                  rows="4"
                  placeholder="Please provide a detailed explanation for why this post is being rejected..."
                ></textarea>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => document.getElementById('rejectForm').classList.add('hidden')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedPost)}
                    className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to check plagiarism
  const handlePlagiarismCheck = async (article) => {
    setCheckingPlagiarism(true);
    try {
      const results = await checkPlagiarism(article);  // Changed from plagiarismService.checkPlagiarism
      setPlagiarismResults(results);
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      setPlagiarismResults({
        error: error.message || 'Failed to check plagiarism. Please try again later.',
      });
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const renderActionButtons = (article) => {
    if (activeTab === 'pending') {
      return (
        <>
          <button
            onClick={() => setSelectedPost(article)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MdVisibility className="text-lg" />
            View
          </button>
          <button
            onClick={() => handleApprove(article)}
            disabled={isUpdating}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdCheckCircle className="text-lg" />
            Approve
          </button>
        </>
      );
    }
    
    return (
      <>
        <Link
          to={`/dashboard/update-items/${article._id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <MdModeEdit className="text-lg" />
          Edit
        </Link>
        <button
          onClick={() => setDeleteConfirm(article)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        >
          <MdDelete className="text-lg" />
          Delete
        </button>
      </>
    );
  };

  // Add Plagiarism Results Modal
  const renderPlagiarismModal = () => {
    if (!plagiarismResults) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Plagiarism Check Results</h3>
            <button
              onClick={() => setPlagiarismResults(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          {plagiarismResults.error ? (
            <div className="text-red-600 mb-4">{plagiarismResults.error}</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Overall Similarity Score
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {plagiarismResults.similarityScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">similar to other sources</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Matched Sources</h4>
                <div className="space-y-3">
                  {plagiarismResults.matches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-blue-600 hover:underline">
                          {match.source}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {match.similarity.toFixed(1)}% similar
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {match.matchedText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setPlagiarismResults(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error?.data?.message || 'Failed to load posts'}</p>
            </div>
          </div>
        )}

        <TableHeader />
        <FilterSection />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading posts...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArticles?.length > 0 ? (
                    filteredArticles.map((article, index) => (
                      <tr key={article._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * postsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="line-clamp-2">{article.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {article.author?.username?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span>{article.author?.username || 'Unknown User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.college}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(article.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {renderActionButtons(article)}
                          </div>
                        </td>
                        </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No {query.status} posts found
                        {(query.search || query.college || query.category || year) && " with the current filters"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete the post "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {renderSelectedPostModal()}
      {renderPlagiarismModal()}
    </section>
  );
};

export default ManagePost;