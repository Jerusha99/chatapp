import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateMessageStatusSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/api/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = updateMessageStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();
    const { status, messageIds } = parsed.data;

    const upserts = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: user.id,
      status,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("message_status")
      .upsert(upserts, { onConflict: "message_id,user_id" })
      .select();
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data });
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
