import axios from "@/services/axios";

import { type WebhookBaseSchema } from "./types";

/**
 * Send a payload to the Botpress webhook.
 */
export async function sendWebhook<T extends WebhookBaseSchema>(
  webhookUrl: string,
  payload: T,
  options?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<void> {
  const { timeoutMs = 10_000, signal } = options ?? {};
  await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: timeoutMs,
    signal,
    "axios-retry": { retries: 0 },
  });
}
