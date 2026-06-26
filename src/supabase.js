import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export async function loadUserProgress(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_progress")
    .select("data")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") {
    console.error("Load error:", error);
    throw error;
  }
  return data?.data ?? null;
}

export async function saveUserProgress(userId, payload) {
  if (!supabase) return;
  const { error } = await supabase
    .from("user_progress")
    .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() },
             { onConflict: "user_id" });
  if (error) {
    console.error("Save error:", error);
    throw error;
  }
}
