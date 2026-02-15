import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, markdownToHtml, extractTableOfContents, getRelatedPosts } from '@/lib/blog';
import { BlogArticleLayout } from '@/components/blog';
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
  const headings = extractTableOfContents(post.content || '');
  const relatedPosts = getRelatedPosts(slug, post.keywords || [], 3);

  return (
    <BlogArticleLayout
      post={post}
      contentHtml={contentHtml}
      headings={headings}
      relatedPosts={relatedPosts}
    />
  );
}
