import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Clock, ChevronRight, BookOpen, GraduationCap } from 'lucide-react';
import { useFetchRelatedArticlesQuery } from '../../../redux/features/articles/articlesApi';

const RelatedArticle = () => {
  const { id } = useParams();
  const { data: articles = [], error, isLoading } = useFetchRelatedArticlesQuery(id);
  
  // Group articles by college
  const articlesByCollege = useMemo(() => {
    return articles.reduce((acc, article) => {
      const college = article.college || 'Other';
      if (!acc[college]) {
        acc[college] = [];
      }
      acc[college].push(article);
      return acc;
    }, {});
  }, [articles]);

  const renderArticleCard = (article) => (
    <Link
      to={`/articles/${article._id}`}
      key={article._id}
      className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
    >
      <div className="flex-shrink-0 relative aspect-square w-20 sm:w-24 rounded-lg overflow-hidden">
        <img
          src={article.coverImg}
          alt=""
          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {article.category && (
          <span className="absolute top-1 right-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            {article.category}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
        
        {article.description && (
          <p className="text-gray-600 line-clamp-2 text-sm">
            {article.description}
          </p>
        )}
        
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{article.author?.username || 'Unknown Author'}</span>
          </span>
          {article.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{article.readTime} min read</span>
            </span>
          )}
          {article.college && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              <span>{article.college}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  const renderCollegeSection = (college, articles) => (
    <div key={college} className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-gray-800">
          {college}
        </h3>
        <span className="text-sm text-gray-500">
          ({articles.length} article{articles.length !== 1 ? 's' : ''})
        </span>
      </div>
      <div className="space-y-3">
        {articles.map(renderArticleCard)}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8" role="status">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <BookOpen className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>
      <p className="text-gray-500">No related articles found</p>
      <Link 
        to="/" 
        className="mt-4 inline-block text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
      >
        Browse all articles
      </Link>
    </div>
  );

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg" role="alert">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <p>Failed to load related articles. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-800">Related Articles</h2>
          {!isLoading && articles.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {articles.length} total
            </span>
          )}
        </div>
        {articles.length > 0 && (
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 text-sm font-medium flex items-center gap-1 group"
          >
            View All
            <ChevronRight 
              className="h-4 w-4 group-hover:translate-x-1 transition-transform" 
              aria-hidden="true" 
            />
          </Link>
        )}
      </div>
      
      <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 mb-6" />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : articles.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(articlesByCollege)
            .sort(([a], [b]) => a.localeCompare(b)) // Sort colleges alphabetically
            .map(([college, collegeArticles]) => 
              renderCollegeSection(college, collegeArticles)
            )}
        </div>
      ) : renderEmptyState()}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {[1, 2].map((section) => (
      <div key={section} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>
        {[1, 2].map((item) => (
          <div key={item} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-24 w-24 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default RelatedArticle;