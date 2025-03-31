import { FallbackTokenImage } from 'components/fallback-token-image'
import React, { useState } from 'react'

export function TokenImageWithFallback({
  containerClassName = '',
  textClassName = '',
  text,
  altText,
  assetImg,
  imageClassName = '',
}: {
  assetImg?: string
  text: string
  containerClassName?: string
  textClassName?: string
  altText?: string
  imageClassName?: string
}) {
  const [useImgFallback, setUseImgFallback] = useState<boolean>(false)

  return assetImg && !useImgFallback ? (
    <img
      className={imageClassName}
      src={assetImg}
      alt={altText}
      onError={() => {
        setUseImgFallback(true)
      }}
    />
  ) : (
    <FallbackTokenImage
      containerClassName={containerClassName}
      textClassName={textClassName}
      text={text}
      key={text}
    />
  )
}
