interface BlogContentProps {
  contentHtml: string;
}

export default function BlogContent({ contentHtml }: BlogContentProps) {
  return (
    <article
      className="prose prose-slate prose-lg max-w-none blog-content"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
