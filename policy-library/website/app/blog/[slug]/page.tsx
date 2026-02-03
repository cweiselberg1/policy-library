import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, markdownToHtml, formatDate } from '@/lib/blog';
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post || !post.content) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5" />

        <div className="relative mx-auto max-w-5xl px-6 py-12 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Article</span>
          </nav>

          {/* Back to Blog Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-8"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Blog
          </Link>

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

          {/* Article Title */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Article Meta */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-slate-400" />
                <span>{post.author}</span>
              </div>
            )}
          </div>

          {/* Keywords */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-200"
                >
                  <TagIcon className="h-3.5 w-3.5" />
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <article className="prose prose-slate prose-lg max-w-none">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>

        {/* Back to Blog CTA */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Blog
          </Link>
        </div>
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
