import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AuthorCardProps {
  author: string;
  date: string;
  lastModified?: string;
}

export default function AuthorCard({ author, date, lastModified }: AuthorCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-copper-500 to-evergreen-600 flex items-center justify-center">
          <ShieldCheckIcon className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{author}</h3>
        <p className="text-sm text-gray-600 mb-2">Healthcare Compliance Solutions</p>
        <div className="text-sm text-gray-500">
          <p>Published: {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {lastModified && (
            <p className="mt-1">Last updated: {new Date(lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
