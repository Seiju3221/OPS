import React, { useEffect, useRef, useState } from 'react'
import {useSelector} from 'react-redux'
import EditorJS from '@editorjs/editorjs'
import List from "@editorjs/list"
import Header from "@editorjs/header"
import { usePostArticleMutation } from '../../../redux/features/articles/articlesApi'
import { useNavigate } from "react-router-dom";

const AddPost = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const [postArticle, {isLoading}] = usePostArticleMutation()

  const {user} = useSelector((state) => state.auth);

  useEffect(() => {
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
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
      }
    })

    return () => {
      editor.destroy();
      editorRef.current = null;
    }
  }, [])

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const content = await editorRef.current.save();
      const newPost = {
        title,
        coverImg,
        content,
        category,
        description: metaDescription,
        author: user?._id,
        rating
      }

      const response = await postArticle(newPost).unwrap();
      alert("Article posted successfully!")
      navigate('/')

    } catch (error) {
      console.error("Failed to create post!", error)
      setMessage("Failed to create post! Try again later")
    }
  }

  return (
    <div className='bg-white md:p-8 p-2'>
      <h2 className='text-2xl font-semibold'>Create a New Post</h2>
      <form className='space-y-5 pt-8'>
        <div className='space-y-4'>
          <label className='font-semibold text-xl'>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' />
        </div>

        <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
          <div className='md:w-2/3 w-full'>
            <p className='font-semibold text-xl mb-5'>Content Section</p>
            <p className='text-xs italic'>Write your post below...</p>
            <div id="editorjs">

            </div>
          </div>
          <div className='md:w-1/3 w-full border p-5 space-y-5'>
            <p className='text-xl font-semibold'>Choose Post Format</p>

            <div>
              <label className='font-semibold'>Post Cover:</label>
              <input type="text" value={coverImg} onChange={(e) => setCoverImg(e.target.value)} required className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' placeholder='https://unsplash.com/image1.png...' />
            </div>

            <div>
              <label className='font-semibold'>Category:</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' placeholder='Technology' />
            </div>

            <div>
              <label className='font-semibold'>Meta Description:</label>
              <textarea type="text" cols={4} rows={4} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} required className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' placeholder='Write the post meta description' />
            </div>

            <div>
              <label className='font-semibold'>Rating:</label>
              <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} required className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' />
            </div>

            <div>
              <label className='font-semibold'>Author:</label>
              <input type="text" value={user.username} disabled className='w-full inline-block bg-bgPrimary focus:outline-none px-5 py-3' placeholder={'{user.username} (not editable)'}  />
            </div>
          </div>
        </div>

        {
          message && <p className="text-red-500">{message}</p>
        }
        <button disabled={isLoading} onClick={handleSubmit} type="submit" className="w-full mt-5 bg-primary hover:bg-indigo-500 text-white font-medium py-3 rounded-md">Create Post</button>

      </form>
    </div>
  )
}

export default AddPost
