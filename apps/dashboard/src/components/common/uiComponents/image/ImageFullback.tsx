import React, { useState, ImgHTMLAttributes } from 'react'
import fallbackSrc from '@/assets/icons/placeholder.svg'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  customFallbackSrc?: string
}

const ImageFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  customFallbackSrc,
  className,
  alt,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [isFallback, setIsFallback] = useState(false)

  return (
    <img
      {...rest}
      src={imgSrc || undefined}
      alt={alt || 'image'}
      className={`${className || ''} ${isFallback ? 'object-contain' : ''}`}
      onError={() => {
        if (!isFallback) {
          setImgSrc(customFallbackSrc ? customFallbackSrc : fallbackSrc)
          setIsFallback(true)
        }
      }}
    />
  )
}

export default ImageFallback
