// Media Library (mock). An uploaded media file, stored as a base64 data URL in
// a JSON record (prototype storage — no binary/object store). Ownership stays on
// ANONYMOUS_OWNER_ID like pages.
export interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
  dataUrl: string; // base64 data URL
  category: string | null;
  ownerId: string;
  uploadedAt: string; // ISO8601
}

export const ANONYMOUS_OWNER_ID = "anonymous";
