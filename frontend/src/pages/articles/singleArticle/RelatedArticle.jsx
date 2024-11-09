import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFetchRelatedArticlesQuery } from '../../../redux/features/articles/articlesApi';

const RelatedArticle = () => {
  const {id} = useParams();
  const {data: articles = [], error, isLoading} = useFetchRelatedArticlesQuery(id);
  return (
    <div className=''>
      <h3 className='text-2xl font-medium pt-8 px-8 pb-5'>Related Articles</h3>
      <hr />
      {
        articles.length > 0 ? (<div className='space-y-4 mt-5'>
          {
            articles.map((article)=> (
              <Link to={`/articles/${article._id}`} key={article._id} className='flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm px-8 py-4'>
                <div className='size-14'>
                  <img src={article.coverImg} alt="" className='h-full w-full rounded-full ring-2 ring-blue-700'/>
                </div>
                <div>
                  <h4 className='font-medium text-[#1E73BE]'>{article?.title.substring(0, 50)}</h4>
                  <p>{article?.description.substring(0, 50)}...</p>
                </div>
              </Link>
            ))
          }
        </div>) : (<div className='p-8'>No related articles found</div>)
      }
    </div>
  )
}

export default RelatedArticle
