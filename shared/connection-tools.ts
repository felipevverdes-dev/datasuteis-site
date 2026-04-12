export interface IpLookupResponse {
  ip: string;
  ipVersion: "IPv4" | "IPv6" | "Desconhecido";
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  userAgent: string;
  os: string;
  browser: string;
}

export type TrafficFlowMode = "normal" | "obfuscated";

export type ThrottlingVerdict =
  | "no_relevant_evidence"
  | "moderate_indication"
  | "strong_indication"
  | "inconclusive";
