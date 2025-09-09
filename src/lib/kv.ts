import { kv, createClient } from "@vercel/kv";

// Create KV client with explicit configuration for better error handling
// Only create client if we have valid environment variables
let kvClient: ReturnType<typeof createClient> | null = null;

function getKvClient() {
  if (!kvClient) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (
      !url ||
      !token ||
      url.includes("placeholder") ||
      token.includes("placeholder") ||
      url.includes("your_")
    ) {
      throw new Error(
        "KV environment variables not configured. Please set up Vercel KV."
      );
    }

    kvClient = createClient({ url, token });
  }
  return kvClient;
}

// Safe wrapper that returns null instead of throwing during development
function getKvClientSafe() {
  try {
    return getKvClient();
  } catch (error) {
    console.warn(
      "KV client not available:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}

export { kv, getKvClient, getKvClientSafe };

// Session management utilities
export interface SessionData {
  id: string;
  createdAt: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
  roomCode?: string;
  role?: "creator" | "participant";
}

export class SessionManager {
  private static readonly SESSION_PREFIX = "session:";
  private static readonly SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

  static async createSession(
    sessionId: string,
    metadata?: Partial<SessionData>
  ): Promise<void> {
    const client = getKvClientSafe();
    if (!client) {
      console.warn("KV not available - session not created");
      return;
    }

    const sessionData: SessionData = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ...metadata,
    };

    await client.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(sessionData)
    );
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const client = getKvClientSafe();
      if (!client) {
        console.warn("KV not available - session not retrieved");
        return null;
      }

      const data = await client.get(`${this.SESSION_PREFIX}${sessionId}`);
      if (!data) return null;

      if (typeof data === "string") {
        return JSON.parse(data) as SessionData;
      }

      // If data is already an object, validate it has required properties
      if (typeof data === "object" && data !== null) {
        const sessionData = data as unknown;
        if (
          typeof sessionData === "object" &&
          sessionData !== null &&
          "id" in sessionData &&
          "createdAt" in sessionData &&
          "lastActivity" in sessionData
        ) {
          return sessionData as SessionData;
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const client = getKvClientSafe();
    if (!client) {
      console.warn("KV not available - session activity not updated");
      return;
    }

    session.lastActivity = new Date().toISOString();
    await client.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(session)
    );
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const client = getKvClientSafe();
    if (!client) {
      console.warn("KV not available - session not deleted");
      return;
    }
    await client.del(`${this.SESSION_PREFIX}${sessionId}`);
  }

  static async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session !== null;
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static readonly RATE_LIMIT_PREFIX = "rate_limit:";
  private static readonly DEFAULT_WINDOW = 60; // 1 minute
  private static readonly DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute

  static async checkRateLimit(
    identifier: string,
    maxRequests: number = this.DEFAULT_MAX_REQUESTS,
    windowSeconds: number = this.DEFAULT_WINDOW
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const client = getKvClientSafe();
      if (!client) {
        console.warn("KV not available - rate limiting disabled");
        return {
          allowed: true,
          remaining: maxRequests,
          resetTime: now + windowSeconds,
        };
      }

      // Get current count
      const current = await client.get(key);
      const count = current ? parseInt(current as string) : 0;

      if (count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + windowSeconds,
        };
      }

      // Increment counter
      await client.incr(key);
      await client.expire(key, windowSeconds);

      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        resetTime: now + windowSeconds,
      };
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowSeconds,
      };
    }
  }
}
