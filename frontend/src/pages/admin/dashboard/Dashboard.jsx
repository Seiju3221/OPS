import React, { useState } from 'react'
import { useSelector } from "react-redux"
import { FiUsers } from "react-icons/fi"
import { FaComments } from "react-icons/fa";
import { GrArticle } from "react-icons/gr";
import { RiAdminLine } from "react-icons/ri"
import { useFetchArticlesQuery } from '../../../redux/features/articles/articlesApi';
import { useGetCommentsQuery } from '../../../redux/features/comments/commentApi';
import { useGetUserQuery } from '../../../redux/features/auth/authApi';
import PostsChart from './PostsChart';

const Dashboard = () => {
  const [query, setQuery] = useState({search: '', category: ''});
  const {user} = useSelector((state) => state.auth);
  const {data: articles= [], error, isLoading} = useFetchArticlesQuery(query);
  const {data: comments= []} = useGetCommentsQuery();
  const {data: users= {}} = useGetUserQuery();
  const adminCount = users.users?.filter(user => user.role === 'admin').length;

  return (
    <>
    {isLoading && (<div>Loading...</div>)}
      <div className='space-y-6'>
        <div className='bg-bgPrimary p-5'>
          <h1>Hi, {user?.username}!</h1>
          <p>Welcome to the admin dashboard.</p>
          <p>Here you can manage the contents uploaded on OPS and other administrative tasks.</p>
        </div>

        <div className='flex flex-col md:flex-row justify-center gap-8 pt-8'>
          <div className='bg-indigo-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center'>
            <FiUsers className='size-8 text-indigo-600'/>
            <p>{user?.length} Users</p>
          </div>
          <div className='bg-red-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center'>
            <GrArticle className='size-8 text-red-600'/>
            <p>{articles.length} Posts</p>
          </div>
          <div className='bg-lime-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center'>
            <RiAdminLine className='size-8 text-lime-600'/>
            <p>{adminCount} Admin{adminCount !== 1 ? 's' : ''}</p>
          </div>
          <div className='bg-orange-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center'>
            <FaComments className='size-8 text-orange-600'/>
            <p>{comments?.totalComment} Comments</p>
          </div>
        </div>

        <div className='pt-5 pb-5'>
          <PostsChart articles={articles} />
        </div>

      </div>
    </>
  )
}

export default Dashboard
