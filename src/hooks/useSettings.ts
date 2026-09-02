import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserSettings {
  user_id: string;
  gemini_api_key: string | null;
  supabase_project_url: string | null;
  telegram_bot_token: string | null;
  telegram_bot_username: string | null;
  telegram_chat_id: number | null;
  telegram_linked_at: string | null;
}

export function useSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_settings")
        .select(
          "user_id, gemini_api_key, supabase_project_url, telegram_bot_token, telegram_bot_username, telegram_chat_id, telegram_linked_at",
        )
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as UserSettings | null;
    },
    enabled: !!user,
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Omit<UserSettings, "user_id">>) => {
      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: user!.id, ...input }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_settings"] }),
  });
}

/** Registers the user's Telegram bot webhook so incoming messages reach this workspace. */
export function useConnectTelegram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (botToken: string) => {
      const { data, error } = await supabase.functions.invoke("telegram-setup", {
        body: { action: "connect", bot_token: botToken },
      });
      if (error) throw new Error((data as any)?.error ?? error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { username: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_settings"] }),
  });
}

export function useDisconnectTelegram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("telegram-setup", { body: { action: "disconnect" } });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_settings"] }),
  });
}
