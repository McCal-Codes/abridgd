export type FeedHealthStatus =
  | "ok"
  | "unreachable"
  | "timeout"
  | "invalid"
  | "empty"
  | "retired"
  | "unknown";

export interface FeedHealth {
  status: FeedHealthStatus;
  message: string;
  checkedAt: number;
  httpStatus?: number;
  itemsFound?: number;
  via?: "direct" | "proxy" | "rss2json";
  url?: string;
  details?: string;
}
