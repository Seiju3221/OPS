import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, ChevronDown, AlertCircle, X, ArrowUpDown, Calendar, ThumbsUp, Eye, Clock, LayoutGrid, 
  List, Loader2, ChevronLeft, ChevronRight, Pause, Play, ArrowRight, InboxIcon,  
  RefreshCcw} from 'lucide-react';
import { useFetchArticlesQuery } from '../../redux/features/articles/articlesApi';
import { debounce } from 'lodash';

const colleges = [
  { id: 'all', label: 'All', group: 'General' },
  { id: 'OU', label: 'Open University', group: 'General' },
  { id: 'ETEEAP', label: 'Expanded Tertiary Education Equivalency and Accreditation Program', group: 'General' },
  { id: 'CCIT', label: 'College of Computing and Information Technologies', group: 'Technology' },
  { id: 'CHS', label: 'College of Health Sciences', group: 'Health' },
  { id: 'CAS', label: 'College of Arts and Sciences', group: 'Arts' },
  { id: 'CBAA', label: 'College of Business Administration and Accountancy', group: 'Business' },
  { id: 'COE', label: 'College of Engineering', group: 'Engineering' },
  { id: 'CCJE', label: 'College of Criminal Justice Education', group: 'Law' },
  { id: 'CTE', label: 'College of Teacher Education', group: 'Education' },
  { id: 'CPA', label: 'College of Public Administration', group: 'Government' },
  { id: 'CSW', label: 'College of Social Work', group: 'Social Sciences' },
  { id: 'CHTM', label: 'College of Hospitality and Tourism Management', group: 'Hospitality' },
  { id: 'COA', label: 'College of Architecture', group: 'Design' },
  { id: 'CFAD', label: 'College of Fine Arts and Design', group: 'Arts' },
  { id: 'CON', label: 'College of Nursing', group: 'Health' },
  { id: 'COM', label: 'College of Medicine', group: 'Health' },
  { id: 'CTECH', label: 'College of Technology', group: 'Technology' },
];

const sortOptions = [
  { id: 'newest', label: 'Newest First', sortBy: 'createdAt', order: -1 },
  { id: 'oldest', label: 'Oldest First', sortBy: 'createdAt', order: 1 },
  { id: 'most_liked', label: 'Most Liked', sortBy: 'likeCount', order: -1 }
];    

// Group colleges by their group property
const groupedColleges = colleges.reduce((acc, college) => {
  if (!acc[college.group]) {
    acc[college.group] = [];
  }
  acc[college.group].push(college);
  return acc;
}, {});

const categories = [
  { id: 'all', label: 'All' },
  { id: 'Extension', label: 'Extension' },
  { id: 'Introduction', label: 'Introduction' },
  { id: 'Production', label: 'Production' },
  { id: 'Training', label: 'Training' }
];

const LoadingState = () => (
  <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-500">Loading featured articles...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
      <p className="text-gray-400 text-center mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-white hover:bg-blue-500 text-gray-900 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  </div>
);

const fetchWithTimeout = async (url, timeout = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const FallbackBanner = () => (
  <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-white">
          Stay Tuned for Featured Stories
        </h2>
        <p className="text-gray-400">
          We're preparing some amazing articles for you.
        </p>
      </div>
    </div>
  </div>
);

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const loadingTimeoutRef = useRef(null);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isAutoPlaying && slides.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 3000);
    }
  }, [isAutoPlaying, slides.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!slides.length) return;
      if (e.key === 'ArrowLeft') navigateControl.prev();
      if (e.key === 'ArrowRight') navigateControl.next();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides]);

  // Preload images
  useEffect(() => {
    if (!slides.length) return;
    slides.forEach(article => {
      if (article.coverImg) {
        const img = new Image();
        img.src = article.coverImg;
      }
    });
  }, [slides]);

  const fetchArticles = useCallback(async () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setError(null);
    setIsLoading(true);
    setIsTimeout(false);

    try {
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setIsTimeout(true);
        }
      }, 10000);

      const response = await fetchWithTimeout(
        'http://localhost:5000/api/articles?status=published&sortBy=createdAt&sortOrder=-1&college='
      );

      if (!isMounted.current) return;

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.articles?.length) {
        throw new Error('No articles available');
      }

      // Filter articles by unique college and ensure they have cover images
      const collegeArticles = data.articles.reduce((acc, article) => {
        if (!acc[article.college] && article.coverImg) {
          acc[article.college] = article;
        }
        return acc;
      }, {});
      
      const finalArticles = Object.values(collegeArticles).slice(0, 5);

      if (!finalArticles.length) {
        throw new Error('No articles available');
      }

      if (isMounted.current) {
        setSlides(finalArticles);
        setIsLoading(false);
        setError(null);
      }

    } catch (error) {
      if (isMounted.current) {
        setError(
          error.name === 'AbortError'
            ? 'Request timed out. Please check your connection.'
            : error.message || 'Failed to load articles'
        );
        setIsLoading(false);
      }
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleRetry = useCallback(() => {
    if (!isLoading) {
      fetchArticles();
    }
  }, [fetchArticles, isLoading]);

  const navigateControl = {
    next: () => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      if (isAutoPlaying) startAutoPlay();
    },
    prev: () => {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      if (isAutoPlaying) startAutoPlay();
    }
  };

  const handleTouch = {
    start: (e) => {
      touchStartRef.current = e.touches[0].clientX;
    },
    move: (e) => {
      touchEndRef.current = e.touches[0].clientX;
    },
    end: () => {
      const difference = touchStartRef.current - touchEndRef.current;
      if (Math.abs(difference) > 75) {
        difference > 0 ? navigateControl.next() : navigateControl.prev();
      }
    }
  };

  if (isLoading && !isTimeout) {
    return <LoadingState />;
  }

  if (isTimeout) {
    return (
      <ErrorState 
        error="Loading is taking longer than usual. Please check your connection."
        onRetry={handleRetry}
      />
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  if (!slides.length) {
    return <FallbackBanner />;
  }

  return (
    <div 
      className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Articles"
      onTouchStart={handleTouch.start}
      onTouchMove={handleTouch.move}
      onTouchEnd={handleTouch.end}
    >
      {slides.map((article, index) => (
        <Link
          key={article._id}
          to={`/articles/${article._id}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
            index === currentSlide 
              ? 'translate-x-0 opacity-100' 
              : index < currentSlide 
                ? '-translate-x-full opacity-0' 
                : 'translate-x-full opacity-0'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <div className="relative w-full h-full">
            <img
              src={article.coverImg || '/placeholder-article.jpg'}
              alt={article.title}
              className="w-full h-full object-cover scale-105 transform transition-transform duration-10000 hover:scale-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-article.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex gap-2 mb-3">
                {article.college && (
                  <span className="px-3 py-1 text-sm font-semibold bg-blue-600/80 text-white rounded-full">
                    {article.college}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2">{article.title}</h2>
              <p className="text-gray-200 line-clamp-2 max-w-2xl">
                {article.description}
              </p>
            </div>
          </div>
        </Link>
      ))}

      {/* Navigation Controls */}
      <div className="absolute top-4 right-4 flex gap-4 z-30">
        <button
          onClick={() => {
            setIsAutoPlaying(!isAutoPlaying);
            startAutoPlay();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-300"
          aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={navigateControl.prev}
              className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={navigateControl.next}
              className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-300"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div 
            className="absolute bottom-4 right-4 flex gap-2"
            role="tablist"
            aria-label="Slide indicators"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/80 w-2'
                }`}
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <Link
      to={`/articles/${article._id}`}
      className="group bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex flex-col h-full border border-gray-200"
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        {article?.coverImg ? (
          <img 
            src={article.coverImg} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-article.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <span className="text-blue-400 font-medium">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {article.featured && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
              Featured
            </span>
          )}
          {article.status === 'published' && (
            <span className="px-2 py-1 text-xs font-semibold bg-green-400 text-green-900 rounded-full">
              Published
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex gap-2 mb-2">
          {article.college && (
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {article.college}
            </span>
          )}
          {article.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              {article.category}
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold line-clamp-2 mb-2 flex-grow">
          {article.title || 'Untitled Article'}
        </h2>

        {article.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {truncateText(article.description, 150)}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{article.likeCount || 0}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{article.viewCount || 0}</span>
          </div>

          {article.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} min read</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const LoadingGrid = () => (
  <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const SortDropdown = ({ sort, setSort }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSort = sortOptions.find(option => option.id === sort) || sortOptions[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 font-medium">Sort by:</span>
      <div className="relative w-full max-w-[200px]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-white border rounded-lg flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            {selectedSort.label}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-20 z-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSort(option.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100"
                >
                  <div className="w-4 h-4 mr-2">
                    {option.id === sort && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CollegeFilter = ({ college, setCollege, handleSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCollege = colleges.find(cat => cat.id === (college || 'all')) || colleges[0];

  const filteredColleges = Object.entries(groupedColleges).reduce((acc, [group, items]) => {
    const filtered = items.filter(cat =>
      cat.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {});

  const handleSelectCollege = (collegeId) => {
    const newCollege = collegeId === 'all' ? '' : collegeId;
    setCollege(newCollege);
    // Immediately update the query after setting the college
    handleSearch(newCollege);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor="college-filter" className="block text-sm font-medium text-gray-700 mb-1">
        College
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border rounded-lg flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{selectedCollege.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border max-h-96 overflow-auto">
            <div className="p-2 border-b sticky top-0 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search college..."
                  className="w-full px-4 py-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="py-2">
              {Object.entries(filteredColleges).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50">
                    {group}
                  </div>
                  {items.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCollege(cat.id)}
                      className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100"
                    >
                      <div className="w-4 h-4 mr-2">
                        {((cat.id === 'all' && !college) || cat.id === college) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CategoryFilter = ({ category, setCategory, handleSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCategory = categories.find(cat => cat.id === (category || 'all')) || categories[0];

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCategory = (categoryId) => {
    const newCategory = categoryId === 'all' ? '' : categoryId;
    setCategory(newCategory);
    handleSearch(undefined, newCategory);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Article Category
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border rounded-lg flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{selectedCategory.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border">
            <div className="p-2 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-4 py-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="py-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100"
                >
                  <div className="w-4 h-4 mr-2">
                    {((cat.id === 'all' && !category) || cat.id === category) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SearchBar = ({ defaultValue, onSearch }) => {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const inputRef = useRef(null);
  
  const debouncedSearch = useMemo(
    () => debounce((value) => onSearch(value), 1000),
    [onSearch]
  );

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            debouncedSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              debouncedSearch.flush();
              onSearch(inputValue);
            }
          }}
          placeholder="Search articles..."
          className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
                   placeholder:text-gray-400 text-gray-900"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      <button
        onClick={() => {
          debouncedSearch.flush();
          onSearch(inputValue);
        }}
        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg 
                 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
                 focus:ring-blue-500 focus:ring-offset-2"
      >
        Search
      </button>
    </div>
  );
};

const Header = () => (
  <div className="bg-white border-b sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <InboxIcon className="w-7 h-7 text-blue-600" />
          Articles Hub
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Articles = () => {
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [view, setView] = useState('grid');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  const [query, setQuery] = useState({
    search: '',
    college: '',
    category: '',
    status: 'published',
    sortBy: 'createdAt',
    sortOrder: -1,
    page: 1,
    pageSize: 12
  });

  const { 
    data: response = { articles: [], total: 0 }, 
    error, 
    isLoading,
    isFetching 
  } = useFetchArticlesQuery({
    search: query.search,
    college: query.college,
    category: query.category,
    status: query.status,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: query.page,
    pageSize: query.pageSize
  });

  const handleSearchUpdate = useCallback((searchValue) => {
    setQuery(prev => ({
      ...prev,
      search: searchValue,
      page: 1
    }));
  }, []);

  const { articles = [], total = 0 } = response || {};
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== query.search) {
      setQuery(prev => ({
        ...prev,
        search: debouncedSearch,
        page: 1 // Reset page when search changes
      }));
    }
  }, [debouncedSearch]);

  useEffect(() => {
    handleSearch(college, category, page);  // Pass current page
  }, [sort, page, pageSize]);

  const handleSearch = useCallback((
    newCollege = college,
    newCategory = category,
    newPage = page
  ) => {
    const selectedSortOption = sortOptions.find(option => option.id === sort);
    
    setQuery(prev => ({
      ...prev,
      search: debouncedSearch,
      college: newCollege,
      category: newCategory,
      sortBy: selectedSortOption.sortBy,
      sortOrder: selectedSortOption.order,
      page: newPage,
      pageSize
    }));
  }, [debouncedSearch, college, category, page, sort, pageSize]);

  const handleClearFilters = () => {
    setSearch('');
    setCollege('');
    setCategory('');
    setSort('newest');
    setPage(1);
    handleSearch('', '', 1);  // Reset search with first page
  };

  const activeFiltersCount = [
    search,
    college,
    category,
    sort !== 'newest'
  ].filter(Boolean).length;

  const FiltersSection = ({ 
    search, college, category, sort,
    activeFiltersCount, handleClearFilters,
    handleSearchUpdate, setSort, setCollege,
    setCategory, handleSearch 
  }) => {
    const [expandedFilters, setExpandedFilters] = useState(false);
  
    return (
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        {/* Main search area - always visible */}
        <div className="p-4 lg:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Find Articles</h2>
                  <p className="text-sm text-gray-500 hidden sm:block">Search across all colleges</p>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 
                           bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear filters</span>
                  <span className="px-1.5 py-0.5 bg-red-100 rounded-md text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
            </div>
  
            <SearchBar
              defaultValue={search}
              onSearch={handleSearchUpdate}
            />
          </div>
        </div>
  
        {/* Expandable filters section */}
        <div className="border-t">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="w-full px-4 lg:px-6 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 rounded-md text-xs font-medium text-blue-700">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters ? 'rotate-180' : ''}`} />
          </button>
  
          {expandedFilters && (
            <div className="px-4 lg:px-6 pb-6 border-t">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <CollegeFilter
                  college={college}
                  setCollege={setCollege}
                  handleSearch={handleSearch}
                />
                <CategoryFilter
                  category={category}
                  setCategory={setCategory}
                  handleSearch={handleSearch}
                />
                <SortDropdown 
                  sort={sort}
                  setSort={setSort}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ViewToggle = () => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => setView('grid')}
        className={`p-2 rounded-lg ${
          view === 'grid' 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => setView('list')}
        className={`p-2 rounded-lg ${
          view === 'list' 
            ? 'bg-blue-100 text-blue-600' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );

  const Pagination = () => (
    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing {Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} of {total} articles
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(1)}  // First page
          disabled={page === 1}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          First
        </button>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {/* Generate page numbers */}
        {(() => {
          let pages = [];
          let startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
          let endPage = Math.min(totalPages, startPage + 4);
          
          if (startPage > 1) {
            pages.push(
              <span key="ellipsis-start" className="px-2">...</span>
            );
          }
          
          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 rounded border ${
                  page === i 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {i}
              </button>
            );
          }
          
          if (endPage < totalPages) {
            pages.push(
              <span key="ellipsis-end" className="px-2">...</span>
            );
          }
          
          return pages;
        })()}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
        <button
          onClick={() => setPage(totalPages)}  // Last page
          disabled={page === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Last
        </button>
      </div>
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(1);  // Reset to first page when changing page size
        }}
        className="px-2 py-1 border rounded"
      >
        <option value="12">12 per page</option>
        <option value="24">24 per page</option>
        <option value="48">48 per page</option>
      </select>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg mb-6">
      <AlertCircle className="w-5 h-5" />
      <div>
        <p className="font-medium">Error loading articles</p>
        <p className="text-sm">{error?.message || 'Please try again later.'}</p>
      </div>
      <button 
        onClick={() => handleSearch()}
        className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <BannerCarousel />
        <FiltersSection 
          search={search}
          college={college}
          category={category}
          sort={sort}
          activeFiltersCount={activeFiltersCount}
          handleClearFilters={handleClearFilters}
          handleSearchUpdate={handleSearchUpdate}
          setSort={setSort}
          setCollege={setCollege}
          setCategory={setCategory}
          handleSearch={handleSearch}
        />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Articles</h1>
          {isFetching && !isLoading && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {error && <ErrorMessage />}

        <div className="flex justify-between items-center mb-6">
          <ViewToggle />
          <div className="text-sm text-gray-600">
            {total} {total === 1 ? 'article' : 'articles'} found
          </div>
        </div>

        {isLoading ? (
          <LoadingGrid />
        ) : (articles?.length === 0) ? (  // Using optional chaining
          <div className="text-center py-12 bg-white rounded-lg border">
            <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className={
            view === 'grid'
              ? "grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6"
              : "space-y-4"
          }>
            {articles?.map((article) => (  // Also add optional chaining here
              <ArticleCard 
                key={article._id} 
                article={article}
                view={view}
              />
            ))}
          </div>
        )}

        {articles.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default Articles;