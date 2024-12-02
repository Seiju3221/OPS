import React, { useState } from 'react';
import { ArrowRight, Bell, Mail, Search, TrendingUp, Newspaper, Award, CalendarDays, GraduationCap } from 'lucide-react';
import FeaturedArticle from './FeaturedArticle';
import { useSubscribeToNewsletterMutation } from '../../redux/features/articles/articlesApi';

const Home = () => {
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [subscribeToNewsletter] = useSubscribeToNewsletterMutation();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      await subscribeToNewsletter({ email }).unwrap();
      setError('');
      setShowModal(true);
    } catch (err) {
      setError(err.data?.error || 'Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-6">
                <h1 className="text-5xl font-bold leading-tight">
                  Discover UNP's Latest
                  <span className="block text-blue-300">Stories & Achievements</span>
                </h1>
                <p className="text-xl text-blue-100">
                  Your source for the latest news, research, and happenings at the University of Northern Philippines
                </p>
                
                {/* New Feature Highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform cursor-pointer border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Newspaper className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Latest News</h3>
                        <p className="text-sm text-blue-200">Campus updates daily</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform cursor-pointer border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Award className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Achievements</h3>
                        <p className="text-sm text-blue-200">Student success stories</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform cursor-pointer border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <CalendarDays className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Events</h3>
                        <p className="text-sm text-blue-200">Upcoming activities</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform cursor-pointer border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Research</h3>
                        <p className="text-sm text-blue-200">Academic insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <img 
                  src="unp.png" 
                  alt="University campus"
                  className="rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* App Introduction Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Bell className="w-4 h-4" />
                  Welcome to PubShark
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Your Gateway to UNP's Stories
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  PubShark is the University of Northern Philippines' premier online publication platform, 
                  bringing you the latest campus news, research breakthroughs, and community stories.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Easy Access</h3>
                      <p className="text-gray-600">Find articles and updates with our powerful search system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Latest Updates</h3>
                      <p className="text-gray-600">Stay informed with real-time campus news and events</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transform rotate-3 rounded-2xl opacity-10"></div>
                <img 
                  src="/api/placeholder/600/400" 
                  alt="PubShark Platform Preview"
                  className="relative rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Articles */}
      <FeaturedArticle />

      {/* Newsletter Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-6 py-3 rounded-full">
              <Bell className="w-5 h-5" />
              <span>Never Miss an Update</span>
            </div>
            <h2 className="text-4xl font-bold">Stay Connected with UNP</h2>
            <p className="text-gray-400">
              Subscribe to our newsletter and get the latest news, events, and research updates 
              delivered directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-full font-medium flex items-center gap-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      </span>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowModal(false);
                setEmail('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <Bell className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900">Welcome to PubShark!</h3>

              <div className="bg-blue-50 text-blue-800 p-6 rounded-xl">
                <p>
                  You're now subscribed to PubShark updates! We've sent a confirmation 
                  email to <span className="font-semibold">{email}</span>.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEmail('');
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;