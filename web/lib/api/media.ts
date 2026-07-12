import { api } from "./client";

export interface UploadUrlResponse {
  upload_url: string;
  params: {
    folder: string;
    public_id: string;
    api_key: string;
    timestamp: number;
    signature: string;
  };
  url: string;
}

export const mediaApi = {
  getUploadUrl: (fileName: string, fileType: string, fileSize: number) =>
    api.post("/api/v1/media/upload-url", {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    }) as Promise<UploadUrlResponse>,

  uploadFile: async (file: File): Promise<string> => {
    const data = await mediaApi.getUploadUrl(file.name, file.type, file.size);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", data.params.api_key);
    formData.append("timestamp", String(data.params.timestamp));
    formData.append("signature", data.params.signature);
    formData.append("folder", data.params.folder);
    formData.append("public_id", data.params.public_id);

    const response = await fetch(data.upload_url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    return result.secure_url as string;
  },
};
