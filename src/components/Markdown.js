import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

// One renderer for the editor's live preview and the public post page, so what you see while
// writing is exactly what gets published. Raw HTML in markdown is not rendered (safe by default).
const components = {
  a: ({ href = "", children, ...props }) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...props}>
        {children}
      </a>
    );
  },
  // Plain <img>: post images are arbitrary sizes from Supabase Storage.
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt = "" }) => <img src={src} alt={alt} loading="lazy" decoding="async" className="rounded-xl" />,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div
      className={`prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-primary prose-a:decoration-primary/40 prose-a:underline-offset-4 hover:prose-a:decoration-primary dark:prose-a:text-primary-dark dark:prose-a:decoration-primary-dark/40 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-dark/10 prose-pre:bg-white dark:prose-pre:border-light/10 dark:prose-pre:bg-white/5 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
