# Quick Setup Guide

## After Installation

### 1. Verify Database Tables

Check that these tables exist:
- `blog_posts` - Stores your blog content
- `webhook_credentials` - Stores API keys

### 2. Verify Storage Bucket

Check that `blog-media` bucket exists and is public.

### 3. Add Routes to Your App

Add these routes to your `App.tsx`:

```tsx
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Webhooks from "./pages/integrations/Webhooks";

// Inside your Routes:
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
<Route 
  path="/integrations/webhooks" 
  element={
    <ProtectedRoute>
      <Webhooks />
    </ProtectedRoute>
  } 
/>
```

### 4. Generate API Credentials

1. Navigate to `/integrations/webhooks`
2. Click "Generate New Key"
3. Give it a name (e.g., "SEO AutoPilot")
4. Copy the API Key (it won't be shown again!)

### 5. Connect Your SEO Platform

In your SEO platform, add a new webhook connection:

- **Endpoint URL**: `https://[your-project].supabase.co/functions/v1/seo-blog-api`
- **API Key**: The key you just generated

### 6. Test the Connection

Your SEO platform should be able to:
1. Test the connection (GET /)
2. Publish posts (POST /posts)
3. Update posts (PUT /posts/:id)

## Troubleshooting

### "Unauthorized" Error
- Check that your API key is correct
- Verify the key is active in `/integrations/webhooks`

### Images Not Appearing
- Check that the `blog-media` bucket exists
- Verify the bucket is set to public
- Check edge function logs for download errors

### Posts Not Showing
- Verify posts have `status: 'published'`
- Check the blog page route is correct
- Check RLS policies are in place

## API Quick Reference

```bash
# Test connection
curl https://[project].supabase.co/functions/v1/seo-blog-api

# List posts
curl -H "x-api-key: YOUR_KEY" \
  https://[project].supabase.co/functions/v1/seo-blog-api/posts

# Create post
curl -X POST \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","content":"<p>Hello</p>"}' \
  https://[project].supabase.co/functions/v1/seo-blog-api/posts
```
