import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchArticleByIdQuery } from '../../../redux/features/articles/articlesApi';
import SingleArticleCard from './SingleArticleCard';
import CommentCard from '../../comments/CommentCard';
import RelatedArticle from './RelatedArticle';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const SingleArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: article, error, isLoading } = useFetchArticleByIdQuery(id);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 rounded-lg p-6 space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Failed to Load Article
            </h2>
            <p className="text-gray-600">
              {error.toString() || "Something went wrong while loading the article."}
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 w-full">
            <SingleArticleCard.Loading />
            <div className="mt-8 animate-pulse bg-white rounded-lg p-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:w-1/3 w-full">
            <div className="animate-pulse bg-white rounded-lg p-8">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article?.post) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Article Not Found
            </h2>
            <p className="text-gray-600">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </button>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article and Comments */}
          <div className="lg:w-2/3 w-full space-y-8">
            <SingleArticleCard article={article.post} />
            <CommentCard comments={article.comments} />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3 w-full lg:sticky lg:top-8 self-start">
            <RelatedArticle />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default SingleArticle;