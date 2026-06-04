import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/getUserProfile";
import { notificationService } from "@/services/notificationService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await notificationService.markAsRead(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await notificationService.deleteNotification(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
