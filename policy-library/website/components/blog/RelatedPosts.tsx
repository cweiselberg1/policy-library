import Link from 'next/link';
import { BlogPost } from '@/lib/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  const displayPosts = posts.slice(0, 3);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {displayPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-copper-400 hover:shadow-lg transition-all duration-200"
          >
            <h3 className="font-semibold text-lg mb-2 text-gray-900 hover:text-copper-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {post.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="text-copper-600 font-medium">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
