import Link from 'next/link';

export default function BlogFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-pearl-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* OGC Branding */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-evergreen-700 to-evergreen-600 flex items-center justify-center text-white font-bold">
            OGC
          </div>
          <div>
            <div className="font-semibold text-evergreen-950">One Guy Consulting</div>
            <div className="text-sm text-[--text-muted]">
              Healthcare Compliance Simplified
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-sm text-[--text-muted] text-center md:text-right">
          <div>&copy; {new Date().getFullYear()} One Guy Consulting</div>
          <div>All rights reserved</div>
        </div>
      </div>

      {/* Back to Blog */}
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white rounded-lg hover:from-copper-700 hover:to-copper-600 transition-all"
        >
          Back to Blog
        </Link>
      </div>
    </footer>
  );
}
