import { NextRequest, NextResponse } from "next/server";
import { getKvClient, SessionManager, RateLimiter } from "@/lib/kv";
import { getSessionId, getClientIP, getUserAgent } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing KV connection and session management...");

    // Test basic KV connection
    const client = getKvClient();
    const testKey = "test:connection";
    const testValue = `test-${Date.now()}`;
    
    await client.set(testKey, testValue);
    const retrievedValue = await client.get(testKey);
    
    if (retrievedValue !== testValue) {
      throw new Error("KV connection test failed - value mismatch");
    }

    // Clean up test key
    await client.del(testKey);

    // Test session management
    const sessionId = getSessionId(request);
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Create a test session
    await SessionManager.createSession(sessionId, {
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    // Retrieve the session
    const session = await SessionManager.getSession(sessionId);
    
    if (!session) {
      throw new Error("Session creation/retrieval failed");
    }

    // Test rate limiting
    const rateLimitResult = await RateLimiter.checkRateLimit(
      `test:${clientIP}`,
      10, // 10 requests
      60  // per minute
    );

    // Update session activity
    await SessionManager.updateSessionActivity(sessionId);

    // Clean up test session
    await SessionManager.deleteSession(sessionId);

    return NextResponse.json({
      success: true,
      message: "KV connection and session management test successful",
      timestamp: new Date().toISOString(),
      results: {
        kvConnection: {
          success: true,
          testValue: retrievedValue,
        },
        sessionManagement: {
          success: true,
          sessionId: sessionId,
          sessionData: session,
        },
        rateLimiting: {
          success: true,
          allowed: rateLimitResult.allowed,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        clientInfo: {
          ip: clientIP,
          userAgent: userAgent,
        },
      },
    });
  } catch (error) {
    console.error("KV test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "KV connection or session management test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, data } = body;

    switch (action) {
      case "create_session":
        const newSessionId = sessionId || getSessionId(request);
        await SessionManager.createSession(newSessionId, {
          ipAddress: getClientIP(request),
          userAgent: getUserAgent(request),
          ...data,
        });
        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          message: "Session created successfully",
        });

      case "get_session":
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: "Session ID required" },
            { status: 400 }
          );
        }
        const session = await SessionManager.getSession(sessionId);
        return NextResponse.json({
          success: true,
          session: session,
        });

      case "delete_session":
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: "Session ID required" },
            { status: 400 }
          );
        }
        await SessionManager.deleteSession(sessionId);
        return NextResponse.json({
          success: true,
          message: "Session deleted successfully",
        });

      case "rate_limit_test":
        const identifier = data?.identifier || getClientIP(request);
        const maxRequests = data?.maxRequests || 5;
        const windowSeconds = data?.windowSeconds || 60;
        
        const rateLimitResult = await RateLimiter.checkRateLimit(
          identifier,
          maxRequests,
          windowSeconds
        );
        
        return NextResponse.json({
          success: true,
          rateLimit: rateLimitResult,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("KV API test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "KV API test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
