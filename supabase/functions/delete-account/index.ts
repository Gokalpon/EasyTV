import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { ok: false, error: "missing_supabase_env" });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse(401, { ok: false, error: "missing_auth" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  const userId = authData?.user?.id;

  if (authError || !userId) {
    return jsonResponse(401, { ok: false, error: "invalid_auth" });
  }

  const body = await req.json().catch(() => ({}));
  if (body?.userId && body.userId !== userId) {
    return jsonResponse(403, { ok: false, error: "user_mismatch" });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { error: dataDeleteError } = await adminClient
    .from("easytv_user_data")
    .delete()
    .eq("user_id", userId);

  if (dataDeleteError) {
    return jsonResponse(500, {
      ok: false,
      error: "user_data_delete_failed",
      details: dataDeleteError.message,
    });
  }

  const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (userDeleteError) {
    return jsonResponse(500, {
      ok: false,
      error: "auth_user_delete_failed",
      details: userDeleteError.message,
    });
  }

  return jsonResponse(200, { ok: true });
});
