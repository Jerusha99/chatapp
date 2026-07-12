import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerSupabaseClient();

    const { data: membership, error: membershipError } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("chat_id", params.chatId)
      .eq("user_id", user.id)
      .single();
    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", params.chatId)
      .single();
    if (chatError) {
      return NextResponse.json(
        { success: false, error: chatError.message },
        { status: 404 }
      );
    }

    const { data: members, error: membersError } = await supabase
      .from("chat_members")
      .select("user_id, role, joined_at, users(id, display_name, avatar_url, bio, phone)")
      .eq("chat_id", params.chatId);
    if (membersError) {
      return NextResponse.json(
        { success: false, error: membersError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...chat,
        members: members || [],
      },
    });
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
