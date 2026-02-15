import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';

interface BlogHeaderProps {
  post: BlogPost;
}

export default function BlogHeader({ post }: BlogHeaderProps) {
  return (
    <header className="relative">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[--text-muted] mb-4">
        <Link href="/blog" className="hover:text-copper-600 transition-colors">
          Blog
        </Link>
        <span>/</span>
        <span className="text-evergreen-950">{post.title}</span>
      </nav>

      {/* Back to Blog Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-[--text-muted] hover:text-copper-600 transition-colors mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Back to Blog</span>
      </Link>

      {/* OGC Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-evergreen-700 to-evergreen-600 text-white text-sm font-medium mb-6">
        <span>One Guy Consulting</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-evergreen-950 mb-6 leading-tight" style={{ fontFamily: 'var(--font-dm-serif)' }}>
        {post.title}
      </h1>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-4 text-[--text-muted] mb-6">
        <time dateTime={post.date} className="text-sm">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span className="text-pearl-400">•</span>
        <span className="text-sm">{post.author}</span>
        <span className="text-pearl-400">•</span>
        <span className="text-sm">{post.readingTime} min read</span>
      </div>

      {/* Keyword Tags */}
      {post.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.keywords.map((keyword) => (
            <span
              key={keyword}
              className="px-3 py-1 bg-pearl-100 text-[--text-secondary] text-sm rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
