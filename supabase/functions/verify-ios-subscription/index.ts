import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const APPLE_API_PROD = "https://api.storekit.itunes.apple.com";
const APPLE_API_SANDBOX = "https://api.storekit-sandbox.itunes.apple.com";
const ALLOWED_PRODUCTS = new Set(["easytv.premium.monthly", "easytv.premium.yearly"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type VerifyPayload = {
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  source?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  return atob(padded);
}

function normalizePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

async function createAppleJwt(): Promise<string> {
  const issuerId = Deno.env.get("APPLE_IAP_ISSUER_ID") ?? "";
  const keyId = Deno.env.get("APPLE_IAP_KEY_ID") ?? "";
  const privateKeyRaw = Deno.env.get("APPLE_IAP_PRIVATE_KEY") ?? "";
  const bundleId = Deno.env.get("APPLE_IAP_BUNDLE_ID") ?? "";

  if (!issuerId || !keyId || !privateKeyRaw || !bundleId) {
    throw new Error("APPLE_IAP_ISSUER_ID / APPLE_IAP_KEY_ID / APPLE_IAP_PRIVATE_KEY / APPLE_IAP_BUNDLE_ID env eksik.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 60 * 60,
    aud: "appstoreconnect-v1",
    bid: bundleId,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const keyData = normalizePrivateKey(privateKeyRaw);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(keyData),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${signingInput}.${encodedSignature}`;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const clean = pem.replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const raw = atob(clean);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

function parseAppleJwsPayload(jws: string): Record<string, unknown> {
  const parts = jws.split(".");
  if (parts.length !== 3) throw new Error("Apple JWS format geçersiz.");
  const payloadJson = base64UrlDecode(parts[1]);
  return JSON.parse(payloadJson);
}

async function fetchAppleTransaction(transactionId: string, bearer: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apple API ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data?.signedTransactionInfo) throw new Error("Apple response signedTransactionInfo içermiyor.");
  return data.signedTransactionInfo as string;
}

function readBool(v: unknown): boolean {
  return v === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { ok: false, message: "Method not allowed" });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse(401, { ok: false, message: "Authorization token gerekli." });
    }

    const body = await req.json() as VerifyPayload;
    const incomingTransactionId = (body.transactionId ?? "").trim();
    const incomingProductId = (body.productId ?? "").trim();

    if (!incomingTransactionId) {
      return jsonResponse(400, { ok: false, message: "transactionId gerekli." });
    }
    if (!incomingProductId || !ALLOWED_PRODUCTS.has(incomingProductId)) {
      return jsonResponse(400, { ok: false, message: "Geçersiz productId." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(500, { ok: false, message: "SUPABASE_URL / SUPABASE_ANON_KEY env eksik." });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return jsonResponse(401, { ok: false, message: "Kullanıcı doğrulanamadı." });
    }
    const userId = userData.user.id;

    const bearer = await createAppleJwt();
    const preferredEnv = (Deno.env.get("APPLE_IAP_ENV") ?? "production").toLowerCase();
    const tryOrder = preferredEnv === "sandbox"
      ? [APPLE_API_SANDBOX, APPLE_API_PROD]
      : [APPLE_API_PROD, APPLE_API_SANDBOX];

    let signedTransactionInfo = "";
    let resolvedEnvironment = "production";
    let lastErr: unknown = null;
    for (const baseUrl of tryOrder) {
      try {
        signedTransactionInfo = await fetchAppleTransaction(incomingTransactionId, bearer, baseUrl);
        resolvedEnvironment = baseUrl === APPLE_API_SANDBOX ? "sandbox" : "production";
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!signedTransactionInfo) {
      return jsonResponse(422, {
        ok: false,
        message: "Apple transaction doğrulanamadı.",
        reason: String(lastErr ?? "unknown"),
      });
    }

    const tx = parseAppleJwsPayload(signedTransactionInfo);
    const appleProductId = String(tx.productId ?? "");
    const bundleId = String(tx.bundleId ?? "");
    const txId = String(tx.transactionId ?? "");
    const originalTxId = String(tx.originalTransactionId ?? "");
    const revocationDateMs = tx.revocationDate ? Number(tx.revocationDate) : null;
    const expiresDateMs = tx.expiresDate ? Number(tx.expiresDate) : null;
    const nowMs = Date.now();

    const requiredBundleId = Deno.env.get("APPLE_IAP_BUNDLE_ID") ?? "";
    if (!requiredBundleId || bundleId !== requiredBundleId) {
      return jsonResponse(422, { ok: false, message: "bundleId eşleşmiyor.", bundleId });
    }
    if (!ALLOWED_PRODUCTS.has(appleProductId) || appleProductId !== incomingProductId) {
      return jsonResponse(422, { ok: false, message: "productId eşleşmiyor.", productId: appleProductId });
    }
    if (!txId || txId !== incomingTransactionId) {
      return jsonResponse(422, { ok: false, message: "transactionId eşleşmiyor.", transactionId: txId });
    }

    const isActive = !readBool(tx.isUpgraded) &&
      revocationDateMs == null &&
      (expiresDateMs == null || expiresDateMs > nowMs);

    const premiumExpiresAt = expiresDateMs ? new Date(expiresDateMs).toISOString() : null;
    const verificationAt = new Date().toISOString();

    const { data: currentRow } = await supabase
      .from("easytv_user_data")
      .select("id,settings")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentSettings = (currentRow?.settings && typeof currentRow.settings === "object")
      ? currentRow.settings as Record<string, unknown>
      : {};

    const nextSettings = {
      ...currentSettings,
      premium: isActive,
      premiumSource: "server-verified-ios",
      premiumProductId: appleProductId,
      premiumExpiresAt: premiumExpiresAt,
      premiumTransactionId: txId,
      premiumOriginalTransactionId: originalTxId || null,
      premiumVerificationEnvironment: resolvedEnvironment,
      premiumLastVerifiedAt: verificationAt,
    };

    let dbErr: { message: string } | null = null;
    if (currentRow?.id) {
      const { error } = await supabase
        .from("easytv_user_data")
        .update({ settings: nextSettings, updated_at: verificationAt })
        .eq("id", currentRow.id);
      dbErr = error;
    } else {
      const { error } = await supabase
        .from("easytv_user_data")
        .insert({ user_id: userId, settings: nextSettings, updated_at: verificationAt });
      dbErr = error;
    }

    if (dbErr) {
      return jsonResponse(500, { ok: false, message: "DB update hatası.", reason: dbErr.message });
    }

    const auditPayload = {
      user_id: userId,
      transaction_id: txId,
      original_transaction_id: originalTxId || null,
      product_id: appleProductId,
      environment: resolvedEnvironment,
      active: isActive,
      expires_at: premiumExpiresAt,
      verified_at: verificationAt,
      raw_payload: tx,
    };
    await supabase
      .from("easytv_iap_verifications")
      .upsert(auditPayload, { onConflict: "transaction_id" });

    return jsonResponse(200, {
      ok: true,
      active: isActive,
      productId: appleProductId,
      transactionId: txId,
      originalTransactionId: originalTxId || null,
      expiresAt: premiumExpiresAt,
      environment: resolvedEnvironment,
      verifiedAt: verificationAt,
    });
  } catch (err) {
    return jsonResponse(500, {
      ok: false,
      message: "verify-ios-subscription hata verdi.",
      reason: err instanceof Error ? err.message : String(err),
    });
  }
});
