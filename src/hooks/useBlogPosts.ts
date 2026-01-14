import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "../types/blog";

export function useBlogPosts(options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ["blog-posts", options],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}
