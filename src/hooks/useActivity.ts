import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ActivityKind = "thread" | "note" | "annotation" | "promotion";
export type ActivitySource = "web" | "mcp" | "telegram";

export interface ActivityEvent {
  id: string;
  user_id: string;
  kind: ActivityKind;
  source: ActivitySource;
  title: string;
  detail: string;
  thread_id: string | null;
  group_id: string | null;
  read_at: string | null;
  created_at: string;
}

export function useActivity(limit = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activity_events", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as ActivityEvent[];
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });
}

export function useMarkActivityRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      let q = supabase.from("activity_events").update({ read_at: new Date().toISOString() }).is("read_at", null);
      if (ids?.length) q = q.in("id", ids);
      else q = q.eq("user_id", user!.id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity_events"] }),
  });
}
