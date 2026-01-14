import { useBlogPosts } from "../hooks/useBlogPosts";
import BlogCard from "../components/blog/BlogCard";
import BlogSEO from "../components/blog/BlogSEO";

export default function Blog() {
  const { data: posts, isLoading, error } = useBlogPosts({ status: "published" });

  return (
    <>
      <BlogSEO
        title="Blog"
        description="Read our latest articles and insights."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Latest articles, insights, and updates
            </p>
          </header>

          {isLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load posts</p>
            </div>
          )}

          {posts && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          )}

          {posts && posts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
