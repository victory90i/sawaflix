import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { notificationService } from "@/services/notificationService";
import { NotificationPayload } from "@/types/notification";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    const body = await req.text();
    
    // Verify QStash signature
    const isValid = await receiver.verify({
      signature,
      body,
    }).catch(() => false);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as NotificationPayload;
    
    // Create the notification in Redis
    const notification = await notificationService.createNotification(payload);

    return NextResponse.json({ success: true, id: notification.id });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
