import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/getUserProfile";
import { notificationService } from "@/services/notificationService";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const notifications = await notificationService.getUserNotifications(user.id, limit);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await notificationService.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
