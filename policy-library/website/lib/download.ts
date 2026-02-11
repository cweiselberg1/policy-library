import JSZip from 'jszip';

// Re-export the Policy type from a type-only import
export type { Policy } from './policies';

/**
 * Download a single policy as a markdown file
 * @param policy - Policy object with title
 * @param content - Policy markdown content
 */
export function downloadPolicy(policy: { title: string }, content: string): void {
  if (!content) {
    console.error('No content provided for download');
    return;
  }

  // Generate a filename from the policy title (sanitized)
  const sanitizedTitle = policy.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const filename = `${sanitizedTitle}.md`;

  // Create a blob and trigger download
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download all policies for a specific entity type as a ZIP file
 * @param policies - Array of policies with file_path and content
 * @param entityType - Entity type for filename generation
 */
export async function downloadPoliciesAsZip(
  policies: Array<{ file_path: string; content?: string }>,
  entityType: 'covered_entity' | 'business_associate'
): Promise<void> {
  try {
    if (policies.length === 0) {
      console.error(`No policies provided for download`);
      return;
    }

    // Create a new JSZip instance
    const zip = new JSZip();

    // Add each policy to the zip with directory structure preserved
    for (const policy of policies) {
      if (policy.content) {
        // Use the file_path from the policy to preserve directory structure
        // Remove the entity type prefix to avoid duplication in the zip
        const relativePath = policy.file_path.replace(/^(covered-entities|business-associates)\//, '');
        zip.file(relativePath, policy.content);
      }
    }

    // Generate the zip file as a blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const typeSlug = entityType === 'covered_entity' ? 'covered-entities' : 'business-associates';
    const filename = `${typeSlug}-policies-${date}.zip`;

    // Create download link and trigger download
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating zip file:', error);
    throw error;
  }
}

/**
 * Download a custom selection of policies as a ZIP file
 * @param policies - Array of policies with file_path and content
 * @param filename - Custom filename for the ZIP file
 */
export async function downloadSelectedPolicies(
  policies: Array<{ file_path: string; content?: string }>,
  filename: string = 'selected-policies.zip'
): Promise<void> {
  try {
    if (policies.length === 0) {
      console.error('No policies selected');
      return;
    }

    // Create a new JSZip instance
    const zip = new JSZip();

    // Add each policy to the zip
    for (const policy of policies) {
      if (policy.content) {
        // Use the file_path from the policy to preserve directory structure
        const relativePath = policy.file_path.replace(/^(covered-entities|business-associates)\//, '');
        zip.file(relativePath, policy.content);
      }
    }

    // Generate the zip file as a blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Create download link and trigger download
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating zip file:', error);
    throw error;
  }
}
