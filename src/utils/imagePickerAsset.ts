import { Platform } from "react-native";

type ImageAsset = {
  uri?: string;
  base64?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type PickedImageData = {
  uri: string;
  base64: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
};

function getFileNameFromUri(uri?: string) {
  if (!uri) return null;

  const cleanUri = uri.split("?")[0];
  const fileName = cleanUri.split("/").pop();

  return fileName || null;
}

function getMimeTypeFromUri(uri?: string) {
  const extension = getFileNameFromUri(uri)?.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  if (extension === "heic" || extension === "heif") return "image/heic";

  return "image/jpeg";
}

function normalizeBase64(value?: string | null) {
  if (!value) return null;

  return value.startsWith("data:") ? value.split(",")[1] || value : value;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function readUriAsBase64(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  return blobToBase64(blob);
}

export async function buildPickedImageData(
  asset: ImageAsset,
): Promise<PickedImageData> {
  const uri = String(asset?.uri || "");
  let base64 = normalizeBase64(asset?.base64);

  if (!base64 && uri) {
    base64 = await readUriAsBase64(uri);
  }

  return {
    uri,
    base64,
    fileName: asset?.fileName || getFileNameFromUri(uri),
    mimeType: asset?.mimeType || getMimeTypeFromUri(uri),
    fileSize: asset?.fileSize ?? (Platform.OS === "web" ? null : null),
  };
}

export function getPickedImageDebugInfo(
  image: PickedImageData | null | undefined,
) {
  return {
    exists: !!image?.uri,
    hasBase64: !!image?.base64,
    base64Length: image?.base64?.length ?? 0,
    fileName: image?.fileName ?? null,
    mimeType: image?.mimeType ?? null,
    fileSize: image?.fileSize ?? null,
    uriScheme: image?.uri?.split(":")[0] ?? null,
  };
}