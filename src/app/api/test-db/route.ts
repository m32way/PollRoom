import { NextResponse } from "next/server";
import { testDatabaseConnection, testSchemaTables } from "@/lib/database-test";

export async function GET() {
  try {
    console.log("🧪 Testing database connection...");
    
    // Test basic connection
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Database connection failed", 
          details: connectionTest.error 
        },
        { status: 500 }
      );
    }
    
    // Test schema tables
    const schemaTest = await testSchemaTables();
    if (!schemaTest.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Schema validation failed", 
          details: schemaTest.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection and schema validation successful",
      timestamp: new Date().toISOString(),
      results: {
        connection: connectionTest,
        schema: schemaTest
      }
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database test failed", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}
