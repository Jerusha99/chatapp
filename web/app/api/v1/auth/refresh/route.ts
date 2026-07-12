import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;
    if (!refresh_token || typeof refresh_token !== "string") {
      return NextResponse.json(
        { success: false, error: "refresh_token is required" },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        session: data.session,
        user: data.user,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
