import React from 'react'
import Banner from './Banner'
import Articles from '../articles/Articles'

const Home = () => {
  return (
    <div className='bg-white text-primary container mx-auto mt-8 p-8'>
      <Banner />
      <Articles />
    </div>
  )
}

export default Home

