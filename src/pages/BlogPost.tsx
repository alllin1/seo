import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBlogPost } from "../hooks/useBlogPosts";
import BlogSEO from "../components/blog/BlogSEO";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
            <div className="h-12 w-full bg-muted animate-pulse rounded mb-4" />
            <div className="h-64 w-full bg-muted animate-pulse rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlogSEO
        title={post.seo_title || post.title}
        description={post.meta_description || post.excerpt || ""}
        image={post.featured_image_url}
        article={{
          publishedTime: post.published_at,
          modifiedTime: post.updated_at,
          author: post.author,
          tags: post.keywords,
        }}
        canonicalUrl={post.canonical_url}
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>

            <header className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && <span>By {post.author}</span>}
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </header>

            {post.featured_image_url && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
