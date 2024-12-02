import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import List from "@editorjs/list";
import Header from "@editorjs/header";
import { useFetchArticleByIdQuery, useUpdateArticleMutation } from '../../../redux/features/articles/articlesApi';
import {
  Camera,
  Image as ImageIcon,
  XCircle,
  Wand2,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

const COLLEGES = [
  'ETEEAP',
  'OU',
  'CCIT',
  'CHS',
  'CAS',
  'CBAA',
  'COE',
  'CCJE',
  'CTE',
  'CPA',
  'CSW',
  'CHTM',
  'COA',
  'CFAD',
  'CON',
  'COM',
  'CTECH',
];

const CATEGORIES = [
  'Extension',
  'Introduction',
  'Production',
  'Training'
]

const UpdatePost = () => {
  const { id } = useParams();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    coverImg: null,
    metaDescription: '',
    college: '',
    category: ''
  });
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [showGrammarResults, setShowGrammarResults] = useState(false);

  const [updateArticle] = useUpdateArticleMutation();
  const { 
    data: article = {}, 
    isLoading, 
    refetch 
  } = useFetchArticleByIdQuery(id);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (article.post) {
      setFormData({
        title: article.post.title,
        coverImg: article.post.coverImg,
        metaDescription: article.post.description,
        college: article.post.college,
        category: article.post.category
      });

      const editor = new EditorJS({
        holder: 'editorjs',
        onReady: () => {
          editorRef.current = editor;
        },
        autofocus: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
        },
        data: JSON.parse(article.post.content),
        placeholder: 'Start writing your article...'
      });

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    }
  }, [article.post]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'category' ? value : value.trim(),
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageFile(file);
    }
  };

  const handleImageFile = async (file) => {
    if (file) {
      try {
        // Store the file directly without uploading to Cloudinary first
        setFormData(prev => ({ ...prev, coverImg: file }));
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        setCoverImagePreview(previewUrl);
      } catch (error) {
        setError('Failed to process image. Please try again.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageFile(file);
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImg: null }));
    setCoverImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const content = await editorRef.current.save();
      let coverImgUrl = formData.coverImg;
      
      // If coverImg is a file, upload it to Cloudinary
      if (formData.coverImg instanceof File) {
        const formData = new FormData();
        formData.append('file', formData.coverImg);
        formData.append('upload_preset', 'df7xwzi0');
        
        const response = await fetch('https://api.cloudinary.com/v1_1/ddtjqbkx4/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        coverImgUrl = data.secure_url;
      }

      const updatedPost = {
        title: formData.title || article.post.title,
        coverImg: coverImgUrl,
        content: JSON.stringify(content),
        category: formData.category || article.post.category,
        college: formData.college || article.post.college,
        description: formData.metaDescription || article.post.description,
        author: user._id
      };

      await updateArticle({ id, ...updatedPost }).unwrap();
      await refetch();
      toast.success('Article updated successfully!');
      navigate('/dashboard/manage-items');
    } catch (err) {
      setError(err.message || 'Failed to update post. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const checkGrammar = async () => {
    if (!editorRef.current) return;
  
    try {
      setIsCheckingGrammar(true);
      setError('');
      setGrammarSuggestions([]);
      setShowGrammarResults(false);
  
      const editorData = await editorRef.current.save();
      
      // Extract text from all blocks
      const textContent = editorData.blocks
        .map(block => block.data.text || '')
        .join('\n')
        .trim();
  
      if (!textContent) {
        setError('No content to check grammar');
        return;
      }
  
      // Make API call to LanguageTool API
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: textContent,
          language: 'en-US',
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Failed to check grammar');
      }
  
      if (data.matches && data.matches.length > 0) {
        setGrammarSuggestions(data.matches);
        setShowGrammarResults(true);
      } else {
        // Show success notification
        setGrammarSuggestions([]);
        setShowGrammarResults(true);
      }
    } catch (err) {
      setError('Failed to check grammar. Please try again.');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const GrammarResults = () => {
    if (!showGrammarResults) return null;
  
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg border-l overflow-y-auto mt-20">
        <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Grammar Check Results
          </h3>
          <button
            onClick={() => setShowGrammarResults(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {grammarSuggestions.length === 0 ? (
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Perfect!</h4>
                <p className="text-sm text-green-700">
                  No grammar issues found in your content.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>Found {grammarSuggestions.length} suggestion{grammarSuggestions.length !== 1 ? 's' : ''}</span>
              </div>
              
              {grammarSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <p className="text-sm font-medium text-yellow-800">
                    {suggestion.message}
                  </p>
                  <p className="mt-1 text-sm text-yellow-700">
                    Context: "...{suggestion.context.text}..."
                  </p>
                  {suggestion.replacements && suggestion.replacements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-yellow-800 font-medium">Suggested fixes:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {suggestion.replacements.slice(0, 3).map((replacement, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-sm bg-white border border-yellow-300 rounded-md text-yellow-800"
                          >
                            {replacement.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold">Edit Post</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter post title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <div className="min-h-[400px] border border-gray-300 rounded-md p-4">
                    <div id="editorjs" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  {coverImagePreview ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={coverImagePreview}
                        alt="Cover Preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Drag and drop your image here, or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              browse
                            </button>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supports: JPG, PNG, GIF (max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College
                  </label>
                  <select
                    name="college"
                    value={formData.college || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select college</option>
                    {COLLEGES.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description for SEO"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard/manage-items')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={checkGrammar}
                disabled={isCheckingGrammar}
                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2 transition-colors"
              >
                {isCheckingGrammar ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-600" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Check Grammar</span>
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px] ${
                  isSaving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showGrammarResults && <GrammarResults />}
    </div>
  );
};

export default UpdatePost;