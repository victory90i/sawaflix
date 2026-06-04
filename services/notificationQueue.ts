'use server';

import { qstashClient } from "@/lib/qstash";
import { NotificationPayload } from "@/types/notification";

if (typeof window !== 'undefined') {
  throw new Error('notificationQueue.ts should only be used in server-side contexts.');
}

const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/webhook`;

export async function publishNotification(payload: NotificationPayload) {
  if (!process.env.QSTASH_TOKEN) {
    console.error("Skipping notification publish: QSTASH_TOKEN is missing.");
    return { success: false, error: "QSTASH_TOKEN is missing" };
  }

  try {
    const response = await qstashClient.publishJSON({
      url: WEBHOOK_URL,
      body: payload,
      // Optional: Add retries or delay
      retries: 3,
    });
    
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error("Failed to publish notification to QStash:", error);
    return { success: false, error };
  }
}
