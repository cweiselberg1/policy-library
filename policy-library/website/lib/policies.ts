import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import matter from 'gray-matter';

export interface Policy {
  id: string;
  title: string;
  file_path: string;
  category: string;
  applies_to: string[];
  hipaa_reference: string;
  required: boolean;
  version: string;
  last_updated: string;
  description: string;
}

export interface PolicyIndex {
  version: string;
  last_updated: string;
  total_policies: number;
  covered_entity_count: number;
  business_associate_count: number;
  categories: string[];
  policies: Policy[];
}

/**
 * Load and parse the policy index JSON file
 */
export function getPolicyIndex(): PolicyIndex {
  const indexPath = path.join(process.cwd(), 'policy-index.json');
  const indexData = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(indexData);
}

/**
 * Get all policies, optionally filtered by entity type
 */
export function getAllPolicies(entityType?: 'covered_entity' | 'business_associate'): Policy[] {
  const index = getPolicyIndex();

  if (!entityType) {
    return index.policies;
  }

  // Filter by entity type and remove duplicates based on ID and entity type
  const filtered = index.policies.filter(policy =>
    policy.applies_to.includes(entityType)
  );

  // Remove duplicates - prefer the file path that matches the entity type
  const uniquePolicies = new Map<string, Policy>();

  filtered.forEach(policy => {
    const key = policy.id;
    const existingPolicy = uniquePolicies.get(key);

    if (!existingPolicy) {
      uniquePolicies.set(key, policy);
    } else {
      // Prefer the policy whose file_path starts with the correct entity type folder
      const entityFolder = entityType === 'covered_entity' ? 'covered-entities' : 'business-associates';
      if (policy.file_path.startsWith(entityFolder)) {
        uniquePolicies.set(key, policy);
      }
    }
  });

  return Array.from(uniquePolicies.values());
}

/**
 * Get a single policy by ID and entity type
 */
export function getPolicyById(id: string, entityType: 'covered_entity' | 'business_associate'): Policy | undefined {
  const policies = getAllPolicies(entityType);
  return policies.find(policy => policy.id === id);
}

/**
 * Get unique categories for a specific entity type
 */
export function getCategories(entityType?: 'covered_entity' | 'business_associate'): string[] {
  const policies = getAllPolicies(entityType);
  const categories = new Set(policies.map(p => p.category));
  return Array.from(categories).sort();
}

/**
 * Get policy count by entity type
 */
export function getPolicyCount(entityType: 'covered_entity' | 'business_associate'): number {
  return getAllPolicies(entityType).length;
}

/**
 * Read policy markdown content (strips frontmatter)
 */
export function getPolicyContent(policy: Policy): string {
  const contentPath = path.join(process.cwd(), policy.file_path);

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf-8');
    const { content } = matter(fileContent);
    return content;
  } catch (error) {
    console.error(`Error reading policy file: ${contentPath}`, error);
    return '';
  }
}

/**
 * Convert markdown content to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkRehype)     // converts mdast -> hast
    .use(rehypeStringify)  // converts hast -> HTML string
    .process(markdown);
  return result.toString();
}

/**
 * Get adjacent policies for navigation (previous/next)
 */
export function getAdjacentPolicies(
  currentId: string,
  entityType: 'covered_entity' | 'business_associate'
): { previous: Policy | null; next: Policy | null } {
  const policies = getAllPolicies(entityType);
  const currentIndex = policies.findIndex(p => p.id === currentId);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? policies[currentIndex - 1] : null,
    next: currentIndex < policies.length - 1 ? policies[currentIndex + 1] : null,
  };
}

/**
 * Search policies by term (searches title, description, HIPAA reference)
 */
export function searchPolicies(
  term: string,
  entityType?: 'covered_entity' | 'business_associate'
): Policy[] {
  const policies = getAllPolicies(entityType);
  const lowerTerm = term.toLowerCase();

  return policies.filter(policy =>
    policy.title.toLowerCase().includes(lowerTerm) ||
    policy.description.toLowerCase().includes(lowerTerm) ||
    policy.hipaa_reference.toLowerCase().includes(lowerTerm) ||
    policy.category.toLowerCase().includes(lowerTerm)
  );
}
