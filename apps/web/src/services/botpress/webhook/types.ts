import { z } from "zod";

/**
 * Base schema for all Botpress webhook payloads.
 * Every webhook call must include a `key` field to identify the event type.
 */
const webhookBaseSchema = z.object({
  key: z.string().min(1, "Webhook key is required"),
});

export type WebhookBaseSchema = z.infer<typeof webhookBaseSchema>;
