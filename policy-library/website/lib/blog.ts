import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
  author: string;
  content?: string;
  readingTime?: number;
  category?: string;
  featured?: boolean;
  lastModified?: string;
  excerpt?: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract excerpt from content (first 160 characters)
 */
function extractExcerpt(content: string): string {
  const plainText = content.replace(/[#*`\[\]]/g, '').trim();
  return plainText.length > 160
    ? plainText.substring(0, 157) + '...'
    : plainText;
}

/**
 * Extract table of contents from markdown
 */
export function extractTableOfContents(markdown: string): TocEntry[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocEntry[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ id, text, level });
  }

  return toc;
}

/**
 * Get related posts based on keyword overlap
 */
export function getRelatedPosts(
  currentSlug: string,
  keywords: string[],
  limit: number = 3
): BlogPost[] {
  const allPosts = getAllBlogPosts().filter(post => post.slug !== currentSlug);

  if (keywords.length === 0) {
    return allPosts.slice(0, limit);
  }

  const scoredPosts = allPosts.map(post => {
    const overlap = post.keywords.filter(k => keywords.includes(k)).length;
    return { post, score: overlap };
  });

  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

/**
 * Get all blog posts with metadata
 */
export function getAllBlogPosts(): BlogPost[] {
  try {
    // Check if blog directory exists
    if (!fs.existsSync(blogDirectory)) {
      console.warn('Blog directory not found:', blogDirectory);
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const allPosts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(blogDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf-8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          keywords: data.keywords || [],
          author: data.author || '',
          readingTime: calculateReadingTime(content),
          category: data.category,
          featured: data.featured,
          lastModified: data.lastModified,
          excerpt: extractExcerpt(content),
        };
      });

    // Sort by date (newest first)
    return allPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      keywords: data.keywords || [],
      author: data.author || '',
      content,
      readingTime: calculateReadingTime(content),
      category: data.category,
      featured: data.featured,
      lastModified: data.lastModified,
      excerpt: extractExcerpt(content),
    };
  } catch (error) {
    console.error('Error reading blog post:', error);
    return null;
  }
}

/**
 * Convert markdown content to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)        // remark plugin: markdown extensions
    .use(remarkRehype)     // converts mdast -> hast
    .use(rehypeSlug)       // rehype plugin: add IDs to headings
    .use(rehypeSanitize, {
      ...defaultSchema,
      clobberPrefix: '',
    })   // rehype plugin: sanitize HTML
    .use(rehypeStringify)  // converts hast -> HTML string
    .process(markdown);
  return result.toString();
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
