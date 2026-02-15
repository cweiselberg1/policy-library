import Link from 'next/link';
import { getAllBlogPosts, formatDate } from '@/lib/blog';
import { BlogFooter } from '@/components/blog';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HIPAA Compliance Blog | One Guy Consulting',
  description: 'Expert insights on HIPAA compliance, healthcare security, and privacy regulations. Learn about best practices, regulatory updates, and compliance strategies.',
  keywords: ['HIPAA blog', 'healthcare compliance', 'HIPAA news', 'privacy regulations', 'security compliance'],
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-pearl-200 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-evergreen-600/5 via-transparent to-copper-600/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-[--text-muted]">
            <Link href="/" className="hover:text-copper-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-evergreen-950 font-medium">Blog</span>
          </nav>

          {/* One Guy Consulting Badge */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-evergreen-700 to-evergreen-600">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-evergreen-700">ONE GUY CONSULTING</p>
              <p className="text-xs text-[--text-muted]">Compliance Blog</p>
            </div>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-evergreen-950 sm:text-6xl" style={{ fontFamily: 'var(--font-dm-serif)' }}>
            HIPAA Compliance Blog
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-8 text-[--text-secondary]">
            Expert insights on healthcare compliance, security best practices, and regulatory updates.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-pearl-400" />
            <h3 className="mt-4 text-lg font-semibold text-evergreen-950">No blog posts yet</h3>
            <p className="mt-2 text-[--text-muted]">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-pearl-200 bg-white p-8 shadow-lg transition-all hover:border-evergreen-300 hover:shadow-2xl hover:shadow-evergreen-600/10"
              >
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-evergreen-600/5 to-copper-600/5 blur-3xl transition-all group-hover:from-evergreen-600/10 group-hover:to-copper-600/10" />

                <div className="relative">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-evergreen-700 to-evergreen-600 shadow-md">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-2xl font-bold text-evergreen-950 transition-colors group-hover:text-copper-600">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-4 text-base leading-relaxed text-[--text-secondary] line-clamp-3">
                    {post.description}
                  </p>

                  {/* Meta Info */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[--text-muted]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-pearl-400" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-pearl-400">•</span>
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.keywords.slice(0, 4).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full bg-evergreen-50 px-3 py-1 text-xs font-medium text-evergreen-700 ring-1 ring-evergreen-200"
                        >
                          <TagIcon className="h-3 w-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-copper-600">
                    Read Article
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
