import { Link } from "react-router-dom";
import type { BlogPost } from "../../types/blog";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      {post.featured_image_url && (
        <Link to={`/blog/${post.slug}`} className="overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          {post.author && (
            <>
              <span>•</span>
              <span>{post.author}</span>
            </>
          )}
        </div>

        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
            {post.excerpt}
          </p>
        )}

        <Link
          to={`/blog/${post.slug}`}
          className="text-sm font-medium text-primary hover:underline mt-auto"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
