import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createChatSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerSupabaseClient();

    const { data: memberships, error: memberError } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", user.id);
    if (memberError) {
      return NextResponse.json(
        { success: false, error: memberError.message },
        { status: 400 }
      );
    }

    const chatIds = (memberships || []).map((m) => m.chat_id);
    if (chatIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: chats, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .in("id", chatIds)
      .order("updated_at", { ascending: false });
    if (chatError) {
      return NextResponse.json(
        { success: false, error: chatError.message },
        { status: 400 }
      );
    }

    const enriched = await Promise.all(
      (chats || []).map(async (chat) => {
        const { data: members } = await supabase
          .from("chat_members")
          .select("user_id, role")
          .eq("chat_id", chat.id);

        const { data: lastMessages } = await supabase
          .from("messages")
          .select("id, content, type, sender_id, created_at")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unreadCount } = await supabase
          .from("message_status")
          .select("*", { count: "exact", head: true })
          .in("message_id", (await supabase
            .from("messages")
            .select("id")
            .eq("chat_id", chat.id)).data?.map((m) => m.id) || [])
          .eq("user_id", user.id)
          .neq("status", "read");

        return {
          ...chat,
          members: members || [],
          last_message: lastMessages?.[0] || null,
          unread_count: unreadCount || 0,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = createChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { type, name, memberIds } = parsed.data;
    const supabase = createServerSupabaseClient();

    if (type === "direct") {
      const otherUserId = memberIds[0];
      const { data: existingChats } = await supabase
        .from("chat_members")
        .select("chat_id, chats!inner(type)")
        .eq("user_id", user.id);
      for (const membership of existingChats || []) {
        if ((membership.chats as any)?.type === "direct") {
          const { data: otherMembers } = await supabase
            .from("chat_members")
            .select("user_id")
            .eq("chat_id", membership.chat_id)
            .neq("user_id", user.id);
          if (
            otherMembers &&
            otherMembers.length === 1 &&
            otherMembers[0].user_id === otherUserId
          ) {
            const { data: existingChat } = await supabase
              .from("chats")
              .select("*")
              .eq("id", membership.chat_id)
              .single();
            return NextResponse.json({
              success: true,
              data: existingChat,
            });
          }
        }
      }
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ type, name })
      .select()
      .single();
    if (chatError) {
      return NextResponse.json(
        { success: false, error: chatError.message },
        { status: 400 }
      );
    }

    const allMemberIds = [user.id, ...memberIds.filter((id) => id !== user.id)];
    const uniqueMemberIds = [...new Set(allMemberIds)];

    const membersToInsert = uniqueMemberIds.map((id, index) => ({
      chat_id: chat.id,
      user_id: id,
      role: index === 0 && id === user.id ? "admin" : "member",
    }));

    const { error: memberError } = await supabase
      .from("chat_members")
      .insert(membersToInsert);
    if (memberError) {
      return NextResponse.json(
        { success: false, error: memberError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: chat });
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
