import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetchArticleByIdQuery } from '../../../redux/features/articles/articlesApi';
import SingleArticleCard from './singleArticleCard';
import CommentCard from '../../comments/CommentCard';
import RelatedArticle from './RelatedArticle';

const singleArticle = () => {
  const {id} = useParams();

  const {data: article, error, isLoading} = useFetchArticleByIdQuery(id);

  return (
    <div className='text-primary container mx-auto mt-8'>
      <div>
        {isLoading && <div>Loading...</div>}
        {error && <div>Something went wrong...</div>}
        {
          article?.post && (
            <div className='flex flex-col lg:flex-row justify-between items-start md:gap-12 gap-8'>
              <div className='lg:w-2/3 w-full'>
                <SingleArticleCard article={article.post}/>
                <CommentCard comments={article?.comments}/>
              </div>
              <div className='bg-white lg:w-1/3 w-full'><RelatedArticle /></div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default singleArticle;
