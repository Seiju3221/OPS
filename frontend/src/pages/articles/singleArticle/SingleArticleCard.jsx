import React from 'react'
import { formatDate } from '../../../utils/formatDate';
import EditorJSHTML from "editorjs-html";

const editorJSHTML = EditorJSHTML();

const SingleArticleCard = ({article}) => {
  const {title, description, content, coverImg, category, rating, author, createdAt} = article || {};
  const htmlContent = editorJSHTML.parse(content).join('')

  return (
    <>
      <div className='bg-white p-8'>
        {/* blog header */}
        <div>
          <h1 className='md:text-4xl text-3xl font-medium mb-4'>{title}</h1>
          <p>{formatDate(createdAt)} by <span className='text-blue-400 cursor-pointer'>Admin {}</span></p>
        </div>
        <div>
          <img src={coverImg} alt="cover image" className='w-full md:h-[520px] bg-cover' />
        </div>
        {/* post details */}
        <div className='mt-8 space-y-4'>
          <div dangerouslySetInnerHTML={{__html: htmlContent}} className='space-y-3 editorjsdiv' />
          <div>
            <span className='text-lg font-medium'>Rating:</span>
            <span> {rating} (based on reviews)</span>
          </div>

        </div>
      </div>
    </>
  )
}

export default SingleArticleCard
