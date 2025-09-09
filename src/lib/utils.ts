import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getSessionId(req: Request): string {
  // Try to get session ID from headers (client-side)
  const sessionHeader = req.headers.get('x-session-id');
  if (sessionHeader) {
    return sessionHeader;
  }

  // Generate a new session ID
  return generateSessionId();
}

export function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "sess_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getClientIP(req: Request): string {
  // Try various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}

export function validateRoomCode(code: string): boolean {
  return typeof code === 'string' && code.length === 6 && /^[A-Z0-9]+$/.test(code);
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

export function isRoomExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true; // If no expiration date, consider expired
  const now = new Date();
  const expiration = new Date(expiresAt);
  return now > expiration;
}

export function getRoomExpirationTime(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}
