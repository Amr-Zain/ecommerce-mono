'use client'

import { useState } from 'react'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from './button'

import { cn } from '../../lib/utils'

const ButtonCopy = ({ content, className }: { content: string, className?: string }) => {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      variant='ghost'
      className={cn('relative disabled:opacity-100 flex items-center justify-center overflow-hidden', className)}
      onClick={handleCopy}
      disabled={copied}
    >
      <div className={cn(
        'transition-all duration-300 flex items-center justify-center',
        copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )}>
        <CheckIcon className='size-4 stroke-primary' />
      </div>
      <div className={cn(
        'absolute inset-0 transition-all duration-300 flex items-center justify-center',
        copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      )}>
        <CopyIcon className='size-4' />
      </div>
    </Button>
  )
}

export default ButtonCopy
