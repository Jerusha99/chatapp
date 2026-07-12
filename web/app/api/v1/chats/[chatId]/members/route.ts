import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { user_ids } = body as { user_ids: string[] };
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "user_ids must be a non-empty array" },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();

    const { data: membership } = await supabase
      .from("chat_members")
      .select("role")
      .eq("chat_id", params.chatId)
      .eq("user_id", user.id)
      .single();
    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can add members" },
        { status: 403 }
      );
    }

    const { data: chat } = await supabase
      .from("chats")
      .select("type")
      .eq("id", params.chatId)
      .single();
    if (!chat || chat.type !== "group") {
      return NextResponse.json(
        { success: false, error: "Members can only be added to group chats" },
        { status: 400 }
      );
    }

    const uniqueIds = [...new Set(user_ids)];
    const membersToInsert = uniqueIds.map((userId) => ({
      chat_id: params.chatId,
      user_id: userId,
      role: "member" as const,
    }));

    const { data: added, error: insertError } = await supabase
      .from("chat_members")
      .insert(membersToInsert)
      .select();
    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: added });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
