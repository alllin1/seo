# SEO Blog Connector for Lovable

A complete blog API system that enables external SEO platforms to publish content directly to your Lovable site. Features automatic image persistence, SEO optimization, and webhook credential management.

## Features

- 📝 **Blog Posts API** - Full CRUD operations for blog content
- 🖼️ **Automatic Image Persistence** - Downloads temporary AI images and stores them permanently
- 🔐 **Secure Webhook Authentication** - API key-based authentication with credential management
- 🔍 **SEO Optimized** - Built-in support for meta tags, Open Graph, Twitter Cards, and JSON-LD
- 📊 **Content Tracking** - Links to external platform content IDs for updates

## Installation

### Step 1: Add to Your Lovable Project

Copy this prompt into your Lovable chat:

```
Install the SEO Blog Connector from GitHub: https://github.com/YOUR-ORG/seo-blog-connector

This should:
1. Run the database migrations to create blog_posts, webhook_credentials tables and blog-media storage bucket
2. Deploy the seo-blog-api edge function
3. Add the blog pages and webhook management UI
```

### Step 2: Run Database Migrations

The migrations will create:
- `blog_posts` table with SEO fields
- `webhook_credentials` table for API key management
- `blog-media` storage bucket for images

### Step 3: Generate API Credentials

1. Go to `/integrations/webhooks` in your site
2. Click "Generate New Key"
3. Copy your API Key and Endpoint URL

### Step 4: Connect Your SEO Platform

Use the API endpoint and key to connect from your SEO platform.

## API Reference

### Base URL
```
https://[your-project].supabase.co/functions/v1/seo-blog-api
```

### Authentication
All requests (except `GET /`) require the `x-api-key` header:
```
x-api-key: your-api-key-here
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API documentation (no auth required) |
| GET | `/posts` | List all posts |
| GET | `/posts/:id` | Get single post by ID or slug |
| POST | `/posts` | Create new post |
| PUT | `/posts/:id` | Update existing post |
| DELETE | `/posts/:id` | Delete post |

### Create Post

```bash
curl -X POST https://[project].supabase.co/functions/v1/seo-blog-api/posts \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "title": "My Blog Post",
    "slug": "my-blog-post",
    "content": "<p>Your HTML content here...</p>",
    "excerpt": "A brief summary",
    "author": "John Doe",
    "featuredImage": "https://replicate.delivery/...",
    "status": "published",
    "contentId": "uuid-from-your-platform",
    "seo": {
      "metaTitle": "My Blog Post | Site Name",
      "metaDescription": "A compelling description for search engines",
      "focusKeyword": "blog post",
      "seoScore": 85
    }
  }'
```

### Response

```json
{
  "success": true,
  "post_id": "uuid",
  "external_id": "uuid-from-your-platform",
  "url": "/blog/my-blog-post",
  "featured_image_url": "https://xxx.supabase.co/storage/v1/object/public/blog-media/uuid-featured.webp"
}
```

## Image Handling

The connector automatically detects temporary image URLs from:
- Replicate (`replicate.delivery`, `pbxt.replicate.delivery`)
- DALL-E (`oaidalleapiprodscus.blob.core.windows.net`)

When a temporary URL is detected:
1. The image is downloaded before it expires
2. Stored permanently in your `blog-media` bucket
3. Named using the content ID for traceability: `{contentId}-featured.webp`
4. The permanent URL is saved to the post

## File Structure

```
├── supabase/
│   ├── migrations/
│   │   ├── 001_blog_posts.sql
│   │   ├── 002_webhook_credentials.sql
│   │   └── 003_storage_bucket.sql
│   └── functions/
│       └── seo-blog-api/
│           └── index.ts
└── src/
    ├── pages/
    │   ├── Blog.tsx
    │   ├── BlogPost.tsx
    │   └── integrations/
    │       └── Webhooks.tsx
    ├── components/
    │   ├── blog/
    │   │   ├── BlogCard.tsx
    │   │   └── BlogSEO.tsx
    │   └── webhooks/
    │       ├── CredentialTable.tsx
    │       ├── GenerateCredentialModal.tsx
    │       └── APIDocumentation.tsx
    ├── hooks/
    │   ├── useBlogPosts.ts
    │   └── useWebhookCredentials.ts
    └── types/
        └── blog.ts
```

## Support

For issues or questions, please open an issue on this repository.

## License

MIT
