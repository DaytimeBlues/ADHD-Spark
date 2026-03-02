export type CaptureSource =
  | "voice"
  | "text"
  | "photo"
  | "paste"
  | "meeting"
  | "checkin";

export type CaptureStatus = "unreviewed" | "promoted" | "discarded";

export interface CaptureItem {
  id: string;
  source: CaptureSource;
  status: CaptureStatus;
  raw: string;
  attachmentUri?: string;
  createdAt: number;
  promotedTo?: "task" | "note";
  promotedAt?: number;
  transcript?: string;
  syncError?: string;
}

export type NewCaptureInput = Omit<CaptureItem, "id" | "createdAt" | "status">;
