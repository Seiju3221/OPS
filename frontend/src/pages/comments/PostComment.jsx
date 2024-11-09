import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usePostCommentMutation } from '../../redux/features/comments/commentApi';
import { useFetchArticleByIdQuery } from '../../redux/features/articles/articlesApi';

const PostComment = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [postComment] = usePostCommentMutation();
  const {refetch} = useFetchArticleByIdQuery(id, {skip: !id})

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Login to comment on this post')
      navigate("/login");
      return;
    }
    const newComment = {
      comment: comment,
      user: user?._id,
      postId: id
    }
    try {
      const response = await postComment(newComment).unwrap();
      alert('Comment created successfully!')
      setComment('');
      refetch()
    } catch (error) {
      alert("An error occurred while posting comment")
    }
  }

  return (
    <div className='mt-8'>
      <h3 className='text-lg font-medium mb-8'>Leave a Comment</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          name="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          cols="30"
          rows="10"
          placeholder='Share your thoughts about this post...'
          className='w-full bg-bgPrimary focus:outline-none p-5'
        />
        <button type='submit' className='w-full bg-primary hover:bg-indigo-500 text-white font-medium py-3 rounded-md'>Submit</button>
      </form>
    </div>
  )
}

export default PostComment