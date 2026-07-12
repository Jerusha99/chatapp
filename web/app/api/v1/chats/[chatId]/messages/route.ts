import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerSupabaseClient();

    const { data: membership } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("chat_id", params.chatId)
      .eq("user_id", user.id)
      .single();
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      100
    );

    let query = supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, display_name, avatar_url),
        reactions:message_reactions(*, user:users!message_reactions_user_id_fkey(id, display_name, avatar_url))
      `
      )
      .eq("chat_id", params.chatId)
      .not("deleted_for", "cs", `["${user.id}"]`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      const { data: cursorMessage } = await supabase
        .from("messages")
        .select("created_at")
        .eq("id", cursor)
        .single();
      if (cursorMessage) {
        query = query.lt("created_at", cursorMessage.created_at);
      }
    }

    const { data: messages, error: messagesError } = await query;
    if (messagesError) {
      return NextResponse.json(
        { success: false, error: messagesError.message },
        { status: 400 }
      );
    }

    const messageIds = (messages || []).map((m) => m.id);
    let statusCounts: Record<string, { sent: number; delivered: number; read: number }> = {};
    if (messageIds.length > 0) {
      const { data: statuses } = await supabase
        .from("message_status")
        .select("message_id, status")
        .in("message_id", messageIds);
      for (const s of statuses || []) {
        if (!statusCounts[s.message_id]) {
          statusCounts[s.message_id] = { sent: 0, delivered: 0, read: 0 };
        }
        statusCounts[s.message_id][s.status as keyof typeof statusCounts[string]]++;
      }
    }

    const enriched = (messages || []).map((m) => ({
      ...m,
      status_counts: statusCounts[m.id] || { sent: 0, delivered: 0, read: 0 },
    }));

    return NextResponse.json({
      success: true,
      data: {
        messages: enriched,
        has_more: enriched.length === limit,
        next_cursor: enriched.length > 0 ? enriched[enriched.length - 1].id : null,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();

    const { data: membership } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("chat_id", params.chatId)
      .eq("user_id", user.id)
      .single();
    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: params.chatId,
        sender_id: user.id,
        type: parsed.data.type,
        content: parsed.data.content,
        media_url: parsed.data.mediaUrl,
        media_width: parsed.data.mediaWidth,
        media_height: parsed.data.mediaHeight,
        media_duration: parsed.data.mediaDuration,
        media_size: parsed.data.mediaSize,
        media_mime_type: parsed.data.mediaMimeType,
        location_lat: parsed.data.locationLat,
        location_lng: parsed.data.locationLng,
        contact_name: parsed.data.contactName,
        contact_phone: parsed.data.contactPhone,
        reply_to_id: parsed.data.replyToId,
      })
      .select()
      .single();
    if (messageError) {
      return NextResponse.json(
        { success: false, error: messageError.message },
        { status: 400 }
      );
    }

    await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", params.chatId);

    const { data: members } = await supabase
      .from("chat_members")
      .select("user_id")
      .eq("chat_id", params.chatId);

    if (members && members.length > 0) {
      const statusRows = members.map((m) => ({
        message_id: message.id,
        user_id: m.user_id,
        status: "sent" as const,
      }));
      await supabase.from("message_status").insert(statusRows);
    }

    return NextResponse.json({ success: true, data: message });
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
