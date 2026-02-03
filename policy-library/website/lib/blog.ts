import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
  author: string;
  content?: string;
}

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

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
        const { data } = matter(fileContents);

        return {
          slug,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          keywords: data.keywords || [],
          author: data.author || '',
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
    .use(html, { sanitize: false })
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
