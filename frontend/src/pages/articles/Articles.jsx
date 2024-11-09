import React, { useState } from 'react'
import SearchArticle from './SearchArticle'
import { useFetchArticlesQuery } from '../../redux/features/articles/articlesApi';
import { Link } from 'react-router-dom';

const Articles = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState({search: "", category: ""});

  // get data using redux
  const {data: articles = [], error, isLoading} = useFetchArticlesQuery(query)

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  }

  const handleSearch = () => setQuery({search, category});

  return (
    <div className='mt-16 container mx-auto'>
      <SearchArticle
      search={search}
      handleSearchChange={handleSearchChange}
      handleSearch={handleSearch}
      />

      {isLoading && <div>Loading...</div>}
      {error && <div>{error.toString}</div>}

      <div className='mt-8 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8'>
        {
          articles.map(article => (
            <Link
            to={`/articles/${article._id}`}
            key={article._id}
            className='shadow-md'>
              <img src={article?.coverImg} alt="" className='h-80 w-full' />
              <h2 className='text-xl p-4'>{article.title}</h2>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default Articles
