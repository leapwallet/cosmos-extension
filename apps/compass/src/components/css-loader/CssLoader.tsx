import React, { CSSProperties } from 'react'

const CssLoader = ({
  className,
  loaderClass,
  style,
}: {
  className?: string
  loaderClass?: string
  style?: CSSProperties
}) => (
  <div className={`lds-ring mt-1 ${className}`} style={style}>
    <div className={loaderClass}></div>
    <div className={loaderClass}></div>
    <div className={loaderClass}></div>
    <div className={loaderClass}></div>
  </div>
)

export default CssLoader
