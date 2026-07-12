import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { editMessageSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = editMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();

    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", params.messageId)
      .single();
    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own messages" },
        { status: 403 }
      );
    }
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    if (message.created_at < fifteenMinAgo) {
      return NextResponse.json(
        { success: false, error: "Messages can only be edited within 15 minutes" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("messages")
      .update({
        content: parsed.data.content,
        edited_at: new Date().toISOString(),
      })
      .eq("id", params.messageId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { delete_for } = body as { delete_for: "me" | "everyone" };
    if (!delete_for || !["me", "everyone"].includes(delete_for)) {
      return NextResponse.json(
        { success: false, error: "delete_for must be 'me' or 'everyone'" },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();

    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", params.messageId)
      .single();
    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }
    if (delete_for === "everyone" && message.sender_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Only the sender can delete for everyone" },
        { status: 403 }
      );
    }

    let deletedFor: string[] = Array.isArray(message.deleted_for)
      ? message.deleted_for
      : [];
    if (delete_for === "everyone") {
      const { data: members } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", message.chat_id);
      deletedFor = [
        ...new Set([...deletedFor, ...(members || []).map((m) => m.user_id)]),
      ];
    } else {
      deletedFor = [...new Set([...deletedFor, user.id])];
    }

    const { data: updated, error: updateError } = await supabase
      .from("messages")
      .update({ deleted_for: deletedFor })
      .eq("id", params.messageId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
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
