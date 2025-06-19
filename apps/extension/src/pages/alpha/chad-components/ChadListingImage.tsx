import React from 'react'

export default function ChadListingImage({
  alt,
  image,
}: {
  alt: string | null
  image: string | null
}) {
  return (
    <img
      src={image ?? `https://placehold.co/40x40?text=${alt}`}
      alt='icon'
      className='w-full h-full object-cover'
      onError={(e) => {
        e.currentTarget.src = `https://placehold.co/40x40?text=${alt}`
      }}
    />
  )
}
