import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Temporary image URL patterns that need to be downloaded and persisted
const TEMP_IMAGE_PATTERNS = [
  "replicate.delivery",
  "pbxt.replicate.delivery",
  "oaidalleapiprodscus.blob.core.windows.net",
  "dalleprodsec.blob.core.windows.net",
];

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  featured_image_url?: string;
  status?: string;
  meta_description?: string;
  seo_title?: string;
  focus_keyword?: string;
  keywords?: string[];
  canonical_url?: string;
  seo_score?: number;
  schema_markup?: object;
  open_graph?: object;
  twitter_card?: object;
  external_id?: string;
  published_at?: string;
}

// Check if URL is a temporary image URL that will expire
function isTemporaryImageUrl(url: string): boolean {
  if (!url) return false;
  return TEMP_IMAGE_PATTERNS.some((pattern) => url.includes(pattern));
}

// Download image and upload to storage, returning permanent URL
async function persistFeaturedImage(
  imageUrl: string,
  contentId: string,
  supabase: any
): Promise<string> {
  // If not a temporary URL, return as-is
  if (!isTemporaryImageUrl(imageUrl)) {
    return imageUrl;
  }

  console.log(`Downloading temporary image: ${imageUrl}`);

  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    // Get content type and determine extension
    const contentType = response.headers.get("content-type") || "image/webp";
    let extension = "webp";
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = "jpg";
    else if (contentType.includes("gif")) extension = "gif";

    // Get image data as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate filename using content ID for traceability
    const fileName = `${contentId}-featured.${extension}`;

    console.log(`Uploading to storage as: ${fileName}`);

    // Upload to storage bucket (upsert to handle updates)
    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(fileName, uint8Array, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("blog-media")
      .getPublicUrl(fileName);

    console.log(`Image persisted to: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error persisting image:", error);
    // Return original URL if persistence fails (better than nothing)
    return imageUrl;
  }
}

// Validate API key and return credential info
async function validateApiKey(apiKey: string, supabase: any): Promise<boolean> {
  if (!apiKey) return false;

  const { data, error } = await supabase
    .from("webhook_credentials")
    .select("id, is_active")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single();

  if (error || !data) return false;

  // Update last_used_at
  await supabase
    .from("webhook_credentials")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return true;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Parse request body with field aliases
function parseRequestBody(body: any): Partial<BlogPost> {
  const post: Partial<BlogPost> = {};

  // Basic fields
  post.title = body.title;
  post.slug = body.slug || generateSlug(body.title || "");
  post.content = body.content || body.body || "";
  post.excerpt = body.excerpt;
  post.author = body.author;
  post.status = body.status || "published";

  // Featured image (multiple possible field names)
  const imageUrl = body.featuredImage || body.featured_image || body.image_url;
  if (imageUrl) {
    post.featured_image_url = imageUrl;
  }

  // External ID for linking to source platform
  post.external_id = body.contentId || body.external_id || body.externalId;

  // SEO fields (can be nested or flat)
  if (body.seo) {
    post.seo_title = body.seo.metaTitle || body.seo.seo_title || body.seo.title;
    post.meta_description = body.seo.metaDescription || body.seo.meta_description || body.seo.description;
    post.focus_keyword = body.seo.focusKeyword || body.seo.focus_keyword || body.seo.keyword;
    post.seo_score = body.seo.seoScore || body.seo.seo_score || body.seo.score;
    post.canonical_url = body.seo.canonicalUrl || body.seo.canonical_url || body.seo.canonical;
  } else {
    post.seo_title = body.seo_title || body.seoTitle || body.metaTitle;
    post.meta_description = body.meta_description || body.metaDescription;
    post.focus_keyword = body.focus_keyword || body.focusKeyword;
    post.seo_score = body.seo_score || body.seoScore;
    post.canonical_url = body.canonical_url || body.canonicalUrl;
  }

  // Keywords
  post.keywords = body.keywords || body.tags || [];

  // Schema markup
  if (body.schema) {
    post.schema_markup = body.schema.jsonLd || body.schema;
  } else if (body.schema_markup) {
    post.schema_markup = body.schema_markup;
  }

  // Open Graph
  post.open_graph = body.openGraph || body.open_graph || {};

  // Twitter Card
  post.twitter_card = body.twitter || body.twitter_card || body.twitterCard || {};

  // Published date
  post.published_at = body.published_at || body.publishedAt || new Date().toISOString();

  return post;
}

// API Documentation response
function getApiDocs(baseUrl: string) {
  return {
    name: "SEO Blog API",
    version: "1.0.0",
    description: "API for managing blog posts with SEO optimization",
    endpoints: {
      "GET /": "API documentation (this page)",
      "GET /posts": "List all posts (requires auth)",
      "GET /posts/:id": "Get single post by ID or slug (requires auth)",
      "POST /posts": "Create new post (requires auth)",
      "PUT /posts/:id": "Update existing post (requires auth)",
      "DELETE /posts/:id": "Delete post (requires auth)",
    },
    authentication: {
      type: "API Key",
      header: "x-api-key",
      description: "Include your API key in the x-api-key header",
    },
    example: {
      createPost: {
        method: "POST",
        url: `${baseUrl}/posts`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "your-api-key",
        },
        body: {
          title: "My Blog Post",
          slug: "my-blog-post",
          content: "<p>Your HTML content here...</p>",
          excerpt: "A brief summary",
          author: "John Doe",
          featuredImage: "https://example.com/image.jpg",
          status: "published",
          contentId: "uuid-from-your-platform",
          seo: {
            metaTitle: "My Blog Post | Site Name",
            metaDescription: "A compelling description",
            focusKeyword: "blog post",
            seoScore: 85,
          },
        },
      },
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/seo-blog-api/, "");
    const pathParts = path.split("/").filter(Boolean);

    // API documentation (no auth required)
    if (path === "" || path === "/" || path === "/docs") {
      const baseUrl = `${supabaseUrl}/functions/v1/seo-blog-api`;
      return new Response(JSON.stringify(getApiDocs(baseUrl), null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other endpoints require API key
    const apiKey = req.headers.get("x-api-key");
    const isValid = await validateApiKey(apiKey || "", supabase);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or missing API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /posts - List posts
    if (pathParts[0] === "posts" && !pathParts[1] && req.method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const status = url.searchParams.get("status");
      const offset = (page - 1) * limit;

      let query = supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          posts: data,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /posts/:id - Get single post
    if (pathParts[0] === "posts" && pathParts[1] && req.method === "GET") {
      const idOrSlug = pathParts[1];

      // Try by ID first, then by slug
      let query = supabase.from("blog_posts").select("*");

      // Check if it looks like a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Not found", message: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /posts - Create post
    if (pathParts[0] === "posts" && !pathParts[1] && req.method === "POST") {
      const body = await req.json();
      const postData = parseRequestBody(body);

      if (!postData.title || !postData.content) {
        return new Response(
          JSON.stringify({ error: "Bad request", message: "Title and content are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate content ID if not provided
      const contentId = postData.external_id || crypto.randomUUID();
      postData.external_id = contentId;

      // Check if post with this external_id already exists (upsert behavior)
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("external_id", contentId)
        .single();

      if (existingPost) {
        // Update existing post instead of creating new
        console.log(`Post with external_id ${contentId} exists, updating...`);

        // Handle image persistence if provided
        if (postData.featured_image_url) {
          postData.featured_image_url = await persistFeaturedImage(
            postData.featured_image_url,
            contentId,
            supabase
          );
        }

        const { data: updated, error: updateError } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", existingPost.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            action: "updated",
            post_id: updated.id,
            external_id: updated.external_id,
            url: `/blog/${updated.slug}`,
            featured_image_url: updated.featured_image_url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle image persistence for new post
      if (postData.featured_image_url) {
        postData.featured_image_url = await persistFeaturedImage(
          postData.featured_image_url,
          contentId,
          supabase
        );
      }

      // Create new post
      const { data: newPost, error: createError } = await supabase
        .from("blog_posts")
        .insert(postData)
        .select()
        .single();

      if (createError) {
        console.error("Create error:", createError);
        throw createError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: "created",
          post_id: newPost.id,
          external_id: newPost.external_id,
          url: `/blog/${newPost.slug}`,
          featured_image_url: newPost.featured_image_url,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /posts/:id - Update post
    if (pathParts[0] === "posts" && pathParts[1] && req.method === "PUT") {
      const idOrSlug = pathParts[1];
      const body = await req.json();
      const postData = parseRequestBody(body);

      // Find the post
      let query = supabase.from("blog_posts").select("id, external_id");
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data: existing, error: findError } = await query.single();

      if (findError || !existing) {
        return new Response(
          JSON.stringify({ error: "Not found", message: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle image persistence if new image provided
      if (postData.featured_image_url) {
        const contentId = postData.external_id || existing.external_id || existing.id;
        postData.featured_image_url = await persistFeaturedImage(
          postData.featured_image_url,
          contentId,
          supabase
        );
      }

      // Update post
      const { data: updated, error: updateError } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          post_id: updated.id,
          external_id: updated.external_id,
          url: `/blog/${updated.slug}`,
          featured_image_url: updated.featured_image_url,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE /posts/:id - Delete post
    if (pathParts[0] === "posts" && pathParts[1] && req.method === "DELETE") {
      const idOrSlug = pathParts[1];

      // Find the post
      let query = supabase.from("blog_posts").select("id, featured_image_url");
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data: existing, error: findError } = await query.single();

      if (findError || !existing) {
        return new Response(
          JSON.stringify({ error: "Not found", message: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete the post
      const { error: deleteError } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;

      // Optionally delete the associated image
      if (existing.featured_image_url && existing.featured_image_url.includes("blog-media")) {
        try {
          const fileName = existing.featured_image_url.split("/").pop();
          if (fileName) {
            await supabase.storage.from("blog-media").remove([fileName]);
          }
        } catch (e) {
          console.error("Error deleting image:", e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Post deleted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ error: "Not found", message: "Endpoint not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
