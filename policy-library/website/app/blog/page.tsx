import Link from 'next/link';
import { getAllBlogPosts, formatDate } from '@/lib/blog';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Blog</span>
          </nav>

          {/* One Guy Consulting Badge */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-600">ONE GUY CONSULTING</p>
              <p className="text-xs text-slate-600">Compliance Blog</p>
            </div>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            HIPAA Compliance Blog
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
            Expert insights on healthcare compliance, security best practices, and regulatory updates.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No blog posts yet</h3>
            <p className="mt-2 text-slate-600">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-600/10"
              >
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-blue-600/5 to-cyan-600/5 blur-3xl transition-all group-hover:from-blue-600/10 group-hover:to-cyan-600/10" />

                <div className="relative">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-2xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-4 text-base leading-relaxed text-slate-700 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Meta Info */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">•</span>
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
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                        >
                          <TagIcon className="h-3 w-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Read Article
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">One Guy Consulting</p>
                <p className="text-xs text-slate-600">Healthcare Compliance Solutions</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              © 2026 One Guy Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
