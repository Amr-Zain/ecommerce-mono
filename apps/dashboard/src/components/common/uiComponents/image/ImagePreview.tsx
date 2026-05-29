import React, { useEffect, useState, ImgHTMLAttributes, forwardRef } from 'react'
import fallbackSrc from '@/assets/icons/placeholder.svg'
import { ImageModal } from '../ImageModal'
import { Button } from '@ecommerce/ui/components/button'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  customFallbackSrc?: string
}

const ImageWithPreview = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, customFallbackSrc, className = '', alt = 'image', ...rest }, ref) => {
    const getDisplaySrc = (srcValue: any) => {
      if (typeof srcValue === 'string' && srcValue.trim()) {
        return srcValue
      }
      return customFallbackSrc || (fallbackSrc as any)
    }

    const [imgSrc, setImgSrc] = useState<string>(getDisplaySrc(src))
    const [isFallback, setIsFallback] = useState(
      !(typeof src === 'string' && src.trim())
    )
    const [previewOpen, setPreviewOpen] = useState(false)

    // If the incoming src changes, reset the state so we can try loading again
    useEffect(() => {
      const newSrc = getDisplaySrc(src)
      setImgSrc(newSrc)
      setIsFallback(!(typeof src === 'string' && src.trim()))
    }, [src, customFallbackSrc])

    const handleError = () => {
      if (!isFallback) {
        setImgSrc(customFallbackSrc || (fallbackSrc as any))
        setIsFallback(true)
      }
    }

    return (
      <div className={cn("relative group inline-flex overflow-hidden", className)}>
        <img
          ref={ref}
          {...rest}
          src={imgSrc || undefined}
          alt={alt}
          className={cn(className, "w-full h-full", isFallback ? "object-contain" : "object-cover")}
          onError={handleError}
        />

        <div className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-100 group-hover:bg-black/50">
          <div className="flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="pointer-events-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewOpen(true)
                }}
                className="size-8 p-0 hover:bg-transparent bg-transparent border-0"
                aria-label="Preview image"
                title="Preview"
              >
                <Eye className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <ImageModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          imageUrl={imgSrc}
          altText={alt}
        />
      </div>
    )
  }
)

ImageWithPreview.displayName = 'ImageWithPreview'
export default ImageWithPreview
