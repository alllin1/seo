export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  meta_description?: string;
  seo_title?: string;
  focus_keyword?: string;
  keywords: string[];
  canonical_url?: string;
  seo_score?: number;
  schema_markup: Record<string, unknown>;
  open_graph: Record<string, unknown>;
  twitter_card: Record<string, unknown>;
  external_id?: string;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface WebhookCredential {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  author?: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  meta_description?: string;
  seo_title?: string;
  focus_keyword?: string;
  keywords?: string[];
  canonical_url?: string;
  seo_score?: number;
  schema_markup?: Record<string, unknown>;
  open_graph?: Record<string, unknown>;
  twitter_card?: Record<string, unknown>;
  external_id?: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
