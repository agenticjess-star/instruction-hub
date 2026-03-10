import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InstructionGroup {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface InstructionVersion {
  id: string;
  group_id: string;
  version_number: number;
  content: string;
  notes: string;
  is_production: boolean;
  created_at: string;
}

export interface Thread {
  id: string;
  user_id: string;
  group_id: string | null;
  title: string;
  raw_content: string;
  cleaned_content: string;
  platform: string;
  model: string;
  created_at: string;
}

export interface ThreadComment {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["instruction_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instruction_groups")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as InstructionGroup[];
    },
    enabled: !!user,
  });
}

export function useGroup(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["instruction_groups", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instruction_groups")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as InstructionGroup;
    },
    enabled: !!user && !!id,
  });
}

export function useVersions(groupId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["instruction_versions", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instruction_versions")
        .select("*")
        .eq("group_id", groupId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data as InstructionVersion[];
    },
    enabled: !!user && !!groupId,
  });
}

export function useThreads(groupId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["threads", groupId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("threads").select("*").order("created_at", { ascending: false });
      if (groupId) query = query.eq("group_id", groupId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Thread[];
    },
    enabled: !!user,
  });
}

export function useThreadComments(threadId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["thread_comments", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thread_comments")
        .select("*")
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ThreadComment[];
    },
    enabled: !!user && !!threadId,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from("instruction_groups")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as InstructionGroup;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instruction_groups"] }),
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { group_id: string; content: string; notes: string; version_number: number; is_production?: boolean }) => {
      const { data, error } = await supabase
        .from("instruction_versions")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as InstructionVersion;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["instruction_versions", vars.group_id] }),
  });
}

export function usePromoteVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ versionId, groupId }: { versionId: string; groupId: string }) => {
      // Unset all production flags for this group
      await supabase
        .from("instruction_versions")
        .update({ is_production: false })
        .eq("group_id", groupId);
      // Set the target version
      const { error } = await supabase
        .from("instruction_versions")
        .update({ is_production: true })
        .eq("id", versionId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["instruction_versions", vars.groupId] }),
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { title: string; raw_content: string; cleaned_content: string; group_id?: string; platform?: string; model?: string }) => {
      const { data, error } = await supabase
        .from("threads")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Thread;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { thread_id: string; content: string }) => {
      const { data, error } = await supabase
        .from("thread_comments")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as ThreadComment;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["thread_comments", vars.thread_id] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instruction_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instruction_groups"] }),
  });
}
