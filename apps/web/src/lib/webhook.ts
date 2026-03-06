import { z } from "zod";

import axios from "@/lib/axios";

/**
 * Base schema for all Botpress webhook payloads.
 * Every webhook call must include a `key` field to identify the event type.
 */
export const webhookBaseSchema = z.object({
  key: z.string().min(1, "Webhook key is required"),
});

/** Contact form webhook payload */
export const contactWebhookSchema = webhookBaseSchema.extend({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Invalid email address").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export type ContactWebhookPayload = z.infer<typeof contactWebhookSchema>;

/**
 * Send a payload to the Botpress webhook.
 */
export async function sendWebhook<T extends z.infer<typeof webhookBaseSchema>>(
  webhookUrl: string,
  payload: T,
  options?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<void> {
  const { timeoutMs = 10_000, signal } = options ?? {};
  await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: timeoutMs,
    signal,
  });
}
