import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
      <h2 className='font-bold text-gray-300'>The page you are looking for does not exist</h2>
      <Link to='/' className='text-center mt-4 text-indigo-300 underline'>
        Home 🔗
      </Link>
    </div>
  )
}

export default NotFound
