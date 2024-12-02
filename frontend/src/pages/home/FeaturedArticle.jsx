import { useNavigate } from 'react-router-dom';
import { useFetchArticlesQuery } from '../../redux/features/articles/articlesApi';
import { ArrowRight, Bell, Clock, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';

// Add this component for loading state
const ArticleCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"/>
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full"/>
        <div className="h-6 w-32 bg-gray-200 rounded-full"/>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded"/>
      <div className="h-4 w-full bg-gray-200 rounded"/>
      <div className="h-4 w-2/3 bg-gray-200 rounded"/>
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-200 rounded"/>
        <div className="h-6 w-6 bg-gray-200 rounded"/>
      </div>
    </div>
  </div>
);

const FeaturedArticles = () => {
  const navigate = useNavigate();
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [colleges, setColleges] = useState([]);

  const {
    data,
    isLoading,
    isError,
    error
  } = useFetchArticlesQuery({
    status: 'published',
    sortBy: 'likes',
    sortOrder: -1,
    page: 1,
    pageSize: 20 // Fetch more articles to ensure college diversity
  });

  useEffect(() => {
    if (data?.articles) {
      // Extract unique colleges
      const uniqueColleges = [...new Set(data.articles.map(article => article.college))];
      setColleges(uniqueColleges);

      // Select featured articles
      const selectedArticles = [];
      const collegeMap = new Map();

      // Sort articles by likes
      const sortedArticles = [...data.articles].sort((a, b) => b.likes - a.likes);

      for (const article of sortedArticles) {
        // Ensure one article per college
        if (!collegeMap.has(article.college) && selectedArticles.length < 3) {
          selectedArticles.push(article);
          collegeMap.set(article.college, true);
        }

        // If we have 3 articles (one from each college), break
        if (selectedArticles.length === 3) break;
      }

      // If less than 3 articles found, fill with top liked articles
      if (selectedArticles.length < 3) {
        for (const article of sortedArticles) {
          if (!selectedArticles.includes(article) && selectedArticles.length < 3) {
            selectedArticles.push(article);
          }
        }
      }

      setFeaturedArticles(selectedArticles);
    }
  }, [data]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
          <button
            onClick={() => navigate("/articles")}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>Error loading articles: {error?.data?.message || 'Something went wrong'}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
            </>
          ) : (
            featuredArticles.map((article) => (
              <button
                key={article._id}
                onClick={() => navigate(`/articles/${article._id}`)}
                className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 
                           hover:shadow-xl hover:-translate-y-1 cursor-pointer relative"
              >
              <div className="relative overflow-hidden">
                <img 
                  src={article.coverImg || '/api/placeholder/800/400'} 
                  alt={article.title}
                  className="w-full h-48 object-cover transform transition-transform duration-500 
                           group-hover:scale-110"
                />
                {/* Optional overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
              
              <div className="p-6 relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full 
                                   transform transition-transform duration-300 group-hover:scale-105">
                      {article.category}
                    </span>
                    <span className="bg-blue-100 text-indigo-900 text-sm px-3 py-1 rounded-full 
                                   transform transition-transform duration-300 group-hover:scale-105">
                      {article.college}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 
                                transform transition-colors duration-300 group-hover:text-blue-600">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {truncateText(article.description, 120)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      onClick={() => navigate(`/articles/${article._id}`)} 
                      className="text-blue-600 font-medium flex items-center gap-1
                               transform transition-all duration-300 group-hover:gap-2"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4 transform transition-transform duration-300 
                                     group-hover:translate-x-1" />
                    </span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        // Add bookmark functionality here
                      }} 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </button>
            ))
          )}

          {!isLoading && featuredArticles.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Check back later for new stories.</p>
            </div>
          )}
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-sm text-gray-500">
            Unique Colleges: {colleges.join(', ')}
            <br />
            Featured Articles: {featuredArticles.map(a => a.title).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedArticles;