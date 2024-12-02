import React from 'react';
import { formatDate } from '../../../utils/formatDate';
import EditorJSHTML from "editorjs-html";
import { Calendar, User, Heart, Tag, Clock, Eye, Share2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useToggleLikeMutation } from '../../../redux/features/articles/articlesApi';

const editorJSHTML = EditorJSHTML();

const SingleArticleCard = ({ article }) => {
  const user = useSelector(state => state.auth.user);
  const [toggleLike] = useToggleLikeMutation();

  if (!article) {
    return <SingleArticleCard.Loading />;
  }

  const { 
    _id,
    title, 
    metaDescription, 
    content, 
    coverImg, 
    college,
    category, 
    likes,
    likeCount,
    author, 
    createdAt, 
    readTime,
    views 
  } = article;

  // Safely handle the author data
  const authorName = author?.username || 'Admin';

  // Check if current user has liked the article
  const isLiked = user && likes?.includes(user._id);

  // Safely handle content parsing
  const parseContent = (contentData) => {
    if (!contentData) return '';
    
    try {
      if (typeof contentData === 'object') {
        return editorJSHTML.parse(contentData).join('');
      }
      
      const contentObject = JSON.parse(contentData);
      return editorJSHTML.parse(contentObject).join('');
    } catch (error) {
      console.error('Error parsing content:', error);
      return typeof contentData === 'string' ? contentData : '';
    }
  };

  const htmlContent = parseContent(content);
  
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: metaDescription,
        url: window.location.href,
      }).catch(error => console.log('Error sharing:', error));
    }
  };

  const handleLike = async () => {
    if (!user) {
      // You might want to redirect to login or show a login modal
      alert('Please login to like articles');
      return;
    }

    try {
      await toggleLike(_id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const ArticleMetadata = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 text-gray-600">
      <Icon className="h-4 w-4" />
      <span>{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        {coverImg ? (
          <img 
            src={coverImg} 
            alt={title || 'Article cover'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* College Badge */}
        {college && (
          <span className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            {college}
          </span>
        )}
        
        {/* Category Badge */}
        {category && (
          <span className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            {category}
          </span>
        )}
      </div>

      {/* Content Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {title || 'Untitled Article'}
          </h1>
          
          {metaDescription && (
            <p className="text-lg text-gray-600">
              {metaDescription}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="border-y border-gray-200 py-4 my-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {createdAt && (
                <ArticleMetadata 
                  icon={Calendar} 
                  label="Published" 
                  value={formatDate(createdAt)} 
                />
              )}
              <ArticleMetadata 
                icon={User} 
                label="Author" 
                value={authorName} 
              />
              {readTime && (
                <ArticleMetadata 
                  icon={Clock} 
                  label="Read Time" 
                  value={`${readTime} min`} 
                />
              )}
              {views && (
                <ArticleMetadata 
                  icon={Eye} 
                  label="Views" 
                  value={views.toLocaleString()} 
                />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        {htmlContent && (
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
              className="space-y-6"
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Heart 
                className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`}
              />
              <span className="font-medium">{likeCount || 0}</span>
            </button>

            {college && (
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                <span className="text-gray-600">College:</span>
                <span className="text-blue-600 font-medium">{college}</span>
              </div>
            )}

            {category && (
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                <span className="text-gray-600">Category:</span>
                <span className="text-blue-600 font-medium">{category}</span>
              </div>
            )}

            <button
              onClick={shareArticle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
};

SingleArticleCard.Loading = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="h-64 md:h-96 bg-gray-200" />
    <div className="p-8 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  </div>
);

export default SingleArticleCard;