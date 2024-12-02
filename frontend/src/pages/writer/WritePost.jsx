import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import List from "@editorjs/list";
import Header from "@editorjs/header";
import { usePostArticleMutation } from '../../redux/features/articles/articlesApi';
import { 
  AlertCircle,  
  Upload,
  X
} from 'lucide-react';

const POST_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
};

const COLLEGES = [
  'ETEEAP','OU','CCIT', 'CHS', 'CAS', 'CBAA', 'COE', 'CCJE', 'CTE',
  'CPA', 'CSW', 'CHTM', 'COA', 'CFAD', 'CON', 'COM', 'CTECH',
];

const CATEGORIES = [
   'Extension', 'Introduction', 'Production', 'Training'
];

const WritePost = () => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    coverImg: null,
    description: '',
    college: '',
    category: '',
    status: POST_STATUS.PENDING
  });
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({
    isChecking: false,
    isLoading: false,
    message: '',
    type: 'info'
  });
  const [grammarCheck, setGrammarCheck] = useState({
    isChecking: false,
    corrections: null,
    showCorrections: false
  });

  const { user } = useSelector((state) => state.auth);
  const [postArticle] = usePostArticleMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) {
      setStatus({
        isLoading: false,
        message: 'You must be logged in to create a post.',
        type: 'error'
      });
      return;
    }

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
      placeholder: 'Start writing your article...'
    });

    return () => {
      if (editor) {
        editor.destroy();
        editorRef.current = null;
      }
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFile = async (file) => {
    if (file) {
      try {
        setFormData(prev => ({ ...prev, coverImg: file }));
        const previewUrl = URL.createObjectURL(file);
        setCoverImagePreview(previewUrl);
      } catch (error) {
        setStatus({
          isLoading: false,
          message: 'Failed to process image. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageFile(file);
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

  const extractTextFromBlocks = (blocks) => {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return block.data.text;
        case 'header':
          return block.data.text;
        case 'list':
          return block.data.items.join(' ');
        default:
          return '';
      }
    }).join(' ');
  };

  const checkGrammar = async () => {
    setGrammarCheck(prev => ({ ...prev, isChecking: true }));
    try {
      const content = await editorRef.current.save();
      const textContent = extractTextFromBlocks(content.blocks);
      
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: textContent,
          language: 'en-US',
        })
      });

      const data = await response.json();
      
      if (data.matches.length > 0) {
        setGrammarCheck({
          isChecking: false,
          corrections: data.matches,
          showCorrections: true
        });
      } else {
        setStatus({
          isChecking: false,
          isLoading: false,
          message: 'No grammar issues found!',
          type: 'success'
        });
      }
    } catch (error) {
      setStatus({
        isChecking: false,
        isLoading: false,
        message: 'Grammar check failed. Please try again.',
        type: 'error'
      });
    }
  };

  const applyCorrections = async (corrections) => {
    const content = await editorRef.current.save();
    const blocks = [...content.blocks];
    let currentOffset = 0;

    blocks.forEach(block => {
      if (!block.data.text) return;
      
      corrections.forEach(correction => {
        const { offset, length, replacements } = correction;
        const suggestedReplacement = replacements[0]?.value || '';
        
        if (offset >= currentOffset && offset < currentOffset + block.data.text.length) {
          const localOffset = offset - currentOffset;
          const before = block.data.text.substring(0, localOffset);
          const after = block.data.text.substring(localOffset + length);
          block.data.text = before + suggestedReplacement + after;
        }
      });
      
      currentOffset += block.data.text.length + 1;
    });

    await editorRef.current.render({ blocks });
    setGrammarCheck({ isChecking: false, corrections: null, showCorrections: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user?._id || !editorRef.current) {
      setStatus({
        isLoading: false,
        message: 'You must be logged in and editor must be initialized.',
        type: 'error'
      });
      return;
    }
  
    if (!formData.coverImg) {
      setStatus({
        isLoading: false,
        message: 'Cover image is required.',
        type: 'error'
      });
      return;
    }
  
    setStatus({ isLoading: true, message: 'Creating post...', type: 'info' });
  
    try {
      const content = await editorRef.current.save();
      
      if (!formData.title || !content || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
  
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', JSON.stringify(content));
      formDataToSubmit.append('college', formData.college);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('coverImg', formData.coverImg);

      await postArticle(formDataToSubmit).unwrap();
      
      setStatus({
        isLoading: false,
        message: 'Post submitted successfully! Awaiting admin approval.',
        type: 'success'
      });
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setStatus({
        isLoading: false,
        message: error.data?.message || error.message || 'Failed to create post! Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-100 via-yellow-100 to-pink-100 p-6 border-b border-gray-200">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Create New Post</h1>
          <p className="text-md text-gray-600 mt-2 opacity-80">Share your insights and experiences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-4 text-2xl font-semibold border-0 border-b-4 border-indigo-200 bg-transparent focus:border-indigo-500 focus:ring-0 transition-colors placeholder-gray-400"
              placeholder="Enter your compelling title..."
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-md font-semibold text-gray-700">Content</h2>
                </div>
                <button
                  type="button"
                  onClick={checkGrammar}
                  disabled={grammarCheck.isChecking}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                >
                  Grammar Check
                </button>
              </div>
              
              <div 
                id="editorjs" 
                className="min-h-[500px] bg-white border border-gray-100 rounded-2xl shadow-md p-4" 
              />
            </div>

            {grammarCheck.showCorrections && grammarCheck.corrections && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-yellow-800">
                    Grammar Suggestions ({grammarCheck.corrections.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setGrammarCheck(prev => ({ ...prev, showCorrections: false }))}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {grammarCheck.corrections.map((correction, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 bg-white rounded">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">{correction.message}</p>
                        {correction.replacements.length > 0 && (
                          <button
                            type="button"
                            onClick={() => applyCorrections([correction])}
                            className="mt-1 text-sm text-blue-600 hover:underline"
                          >
                            Replace with: {correction.replacements[0].value}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => applyCorrections(grammarCheck.corrections)}
                  className="mt-4 w-full py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                >
                  Apply All Corrections
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 border-gray-100">
                Post Configuration
              </h3>
              
              <div className="space-y-6">
                {/* Cover Image Upload Section (Existing code with slight modifications) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  {coverImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-md">
                      <img
                        src={coverImagePreview}
                        alt="Cover Preview"
                        className="w-full h-56 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-2xl p-6 transition-all ${
                        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag and drop or{' '}
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
                  )}
                </div>

                <div className='space-y-4'>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    College
                  </label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">College...</option>
                    {COLLEGES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write a brief description to improve SEO..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Author
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.username}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {status.message && (
          <div className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
            status.type === 'error' ? 'bg-red-50 text-red-700' :
            status.type === 'success' ? 'bg-green-50 text-green-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{status.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status.isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status.isLoading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePost;