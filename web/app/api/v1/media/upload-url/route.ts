import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-helpers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { file_name, file_type, file_size } = body as {
      file_name: string;
      file_type: string;
      file_size: number;
    };

    if (!file_name || !file_type || !file_size) {
      return NextResponse.json(
        { success: false, error: "file_name, file_type, and file_size are required" },
        { status: 400 }
      );
    }

    if (file_size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be under 50MB" },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `chat-bruce/${user.id}`;
    const publicId = `${timestamp}_${file_name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const paramsToSign = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      data: {
        upload_url: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        params: {
          folder,
          public_id: publicId,
          api_key: process.env.CLOUDINARY_API_KEY,
          timestamp,
          signature,
        },
        url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${publicId}`,
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
