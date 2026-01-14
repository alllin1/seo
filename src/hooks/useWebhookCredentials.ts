import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WebhookCredential } from "../types/blog";

export function useWebhookCredentials() {
  return useQuery({
    queryKey: ["webhook-credentials"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("webhook_credentials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WebhookCredential[];
    },
  });
}

export function useCreateWebhookCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a secure random API key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const apiKey = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

      const { data, error } = await supabase
        .from("webhook_credentials")
        .insert({
          user_id: user.id,
          name,
          api_key: apiKey,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WebhookCredential;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-credentials"] });
    },
  });
}

export function useToggleWebhookCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("webhook_credentials")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-credentials"] });
    },
  });
}

export function useDeleteWebhookCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhook_credentials")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-credentials"] });
    },
  });
}
