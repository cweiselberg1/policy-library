import { BlogPost } from '@/lib/blog';
import BlogHeader from './BlogHeader';
import BlogContent from './BlogContent';
import BlogFooter from './BlogFooter';
import TableOfContents from './TableOfContents';
import ShareButtons from './ShareButtons';
import KeyTakeaway from './KeyTakeaway';
import AuthorCard from './AuthorCard';
import RelatedPosts from './RelatedPosts';
import BlogJsonLd from './BlogJsonLd';

interface BlogArticleLayoutProps {
  post: BlogPost;
  contentHtml: string;
  headings: { id: string; text: string; level: 2 | 3 }[];
  relatedPosts: BlogPost[];
  takeaways?: string[];
}

export default function BlogArticleLayout({
  post,
  contentHtml,
  headings,
  relatedPosts,
  takeaways,
}: BlogArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50">
      <BlogJsonLd post={post} url={`/blog/${post.slug}`} />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <BlogHeader post={post} />
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="lg:flex lg:gap-12">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:w-64">
            <div className="sticky top-24 space-y-8">
              {headings.length > 0 && <TableOfContents headings={headings} />}
              <ShareButtons title={post.title} />
            </div>
          </aside>

          {/* Article Column */}
          <div className="flex-1 max-w-3xl">
            {takeaways && takeaways.length > 0 && (
              <KeyTakeaway takeaways={takeaways} />
            )}

            <BlogContent contentHtml={contentHtml} />

            <div className="mt-12 space-y-8">
              <AuthorCard
                author={post.author}
                date={post.date}
                lastModified={post.lastModified}
              />

              {/* Mobile share buttons */}
              <div className="lg:hidden">
                <ShareButtons title={post.title} />
              </div>
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
