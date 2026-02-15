'use client'

import { useState } from 'react'
import { ShareIcon, EnvelopeIcon, LinkIcon } from '@heroicons/react/24/outline'

interface ShareButtonsProps {
  title: string
  url?: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : url || ''

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
      shareUrl
    )}`
    window.location.href = mailtoUrl
  }

  const handleCopyLink = async () => {
    if (!navigator.clipboard) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
      document.body.removeChild(textArea)
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Share:</span>
      <div className="flex gap-2">
        <button
          onClick={handleTwitterShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-copper-600"
          aria-label="Share on Twitter/X"
          title="Share on Twitter/X"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleLinkedInShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-copper-700"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>
        <button
          onClick={handleEmailShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          aria-label="Share via Email"
          title="Share via Email"
        >
          <EnvelopeIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 relative"
          aria-label="Copy link"
          title="Copy link"
        >
          <LinkIcon className="h-5 w-5" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
