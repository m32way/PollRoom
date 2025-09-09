import { NextResponse } from "next/server";
import { EnvironmentValidator, validateEnvironment } from "@/lib/env-validation";

export async function GET() {
  try {
    console.log("🔍 Validating environment configuration...");

    const validation = validateEnvironment();
    const missingVars = EnvironmentValidator.getMissingVariables();
    const placeholderVars = EnvironmentValidator.getPlaceholderVariables();

    return NextResponse.json({
      success: true,
      message: "Environment validation completed",
      timestamp: new Date().toISOString(),
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        missingVariables: missingVars,
        placeholderVariables: placeholderVars,
        config: validation.config,
      },
      recommendations: {
        nextSteps: validation.isValid 
          ? ["Environment is properly configured", "Ready for development"]
          : [
              "Configure missing environment variables",
              "Update placeholder values with actual credentials",
              "Refer to setup documentation for guidance"
            ],
        setupGuide: !validation.isValid ? {
          supabase: "Create a Supabase project and get your URL and keys",
          vercelKv: "Create a Vercel KV database and get your connection details",
          documentation: "See SUPABASE_SETUP.md and VERCEL_KV_SETUP.md for detailed instructions"
        } : null,
      },
    });
  } catch (error) {
    console.error("Environment validation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Environment validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const template = EnvironmentValidator.generateEnvTemplate();
    
    return NextResponse.json({
      success: true,
      message: "Environment template generated",
      template: template,
      instructions: [
        "Copy the template above",
        "Replace placeholder values with actual credentials",
        "Save as .env.local in your project root",
        "Restart your development server"
      ],
    });
  } catch (error) {
    console.error("Template generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Template generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
