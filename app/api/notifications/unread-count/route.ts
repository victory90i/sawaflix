import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/getUserProfile";
import { notificationService } from "@/services/notificationService";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(user.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET unread count error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
