import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPolicies, getPolicyById, getPolicyContent, markdownToHtml, getAdjacentPolicies } from '@/lib/policies';
import { PolicyPageClient } from '@/components/PolicyPageClient';
import type { Metadata } from 'next';

interface PolicyPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate static params for all policies
export async function generateStaticParams() {
  const allPolicies = getAllPolicies();

  return allPolicies.map((policy) => ({
    id: policy.id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // Determine entity type from the ID
  const entityType = decodedId.startsWith('covered-entities') ? 'covered_entity' : 'business_associate';
  const policy = getPolicyById(decodedId, entityType);

  if (!policy) {
    return {
      title: 'Policy Not Found',
    };
  }

  return {
    title: `${policy.title} | HIPAA Policy Library`,
    description: policy.description || `HIPAA policy documentation for ${policy.title}`,
    openGraph: {
      title: policy.title,
      description: policy.description,
      type: 'article',
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // Determine entity type from the ID
  const entityType = decodedId.startsWith('covered-entities') ? 'covered_entity' : 'business_associate';
  const policy = getPolicyById(decodedId, entityType);

  if (!policy) {
    notFound();
  }

  const markdownContent = getPolicyContent(policy);
  const htmlContent = await markdownToHtml(markdownContent);
  const { previous, next } = getAdjacentPolicies(decodedId, entityType);

  const entityLabel = entityType === 'covered_entity' ? 'CE' : 'BA';
  const entityFullName = entityType === 'covered_entity' ? 'Covered Entity' : 'Business Associate';

  return (
    <div className="min-h-screen bg-gray-50">
      <PolicyPageClient
        policyId={decodedId}
        policyTitle={policy.title}
        entityType={entityType}
      />
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/policies?type=${entityType}`} className="hover:text-blue-600">
              {entityFullName} Policies
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{policy.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content Area (70%) */}
          <main className="bg-white rounded-lg shadow-sm p-8">
            {/* Policy Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{policy.title}</h1>

            {/* Rendered Markdown Content */}
            <div
              className="markdown-content max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </main>

          {/* Sidebar (30%) */}
          <aside className="space-y-6">
            {/* Policy Metadata Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h2>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{policy.category}</dd>
                </div>

                {/* HIPAA Reference */}
                {policy.hipaa_reference && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">HIPAA Reference</dt>
                    <dd className="mt-1">
                      <a
                        href={`https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {policy.hipaa_reference}
                      </a>
                    </dd>
                  </div>
                )}

                {/* Applies To Badges */}
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-2">Applies To</dt>
                  <dd className="flex flex-wrap gap-2">
                    {policy.applies_to.map((type) => (
                      <span
                        key={type}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          type === 'covered_entity'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {type === 'covered_entity' ? 'CE' : 'BA'}
                      </span>
                    ))}
                  </dd>
                </div>

                {/* Version */}
                {policy.version && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">{policy.version}</dd>
                  </div>
                )}

                {/* Last Updated */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(policy.last_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>

                {/* Download Button */}
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={`/api/download/policy/${encodeURIComponent(decodedId)}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Policy
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>

              <div className="space-y-3">
                {/* Back to Listing */}
                <Link
                  href={`/policies?type=${entityType}`}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ← Back to {entityFullName} Policies
                </Link>

                {/* Previous Policy */}
                {previous && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Previous</dt>
                    <dd>
                      <Link
                        href={`/policies/${encodeURIComponent(previous.id)}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline line-clamp-2"
                      >
                        {previous.title}
                      </Link>
                    </dd>
                  </div>
                )}

                {/* Next Policy */}
                {next && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Next</dt>
                    <dd>
                      <Link
                        href={`/policies/${encodeURIComponent(next.id)}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline line-clamp-2"
                      >
                        {next.title}
                      </Link>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
