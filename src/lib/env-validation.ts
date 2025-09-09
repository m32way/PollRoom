interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  kv: {
    url: string;
    restApiUrl: string;
    restApiToken: string;
  };
  app: {
    url: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

export class EnvironmentValidator {
  private static readonly REQUIRED_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'NEXT_PUBLIC_APP_URL',
  ];

  private static readonly OPTIONAL_VARS = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'KV_URL',
  ];

  static validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Check required variables
    for (const varName of this.REQUIRED_VARS) {
      const value = process.env[varName];
      if (!value || value.includes('placeholder') || value.includes('your_')) {
        errors.push(`Missing or placeholder value for ${varName}`);
      }
    }

    // Check optional variables
    for (const varName of this.OPTIONAL_VARS) {
      const value = process.env[varName];
      if (value && (value.includes('placeholder') || value.includes('your_'))) {
        warnings.push(`${varName} has placeholder value`);
      }
    }

    // Validate Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      if (!supabaseUrl.includes('.supabase.co')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL should be a valid Supabase URL');
      }
      config.supabase = {
        url: supabaseUrl,
        anonKey: supabaseAnonKey || '',
        serviceRoleKey: supabaseServiceKey,
      };
    }

    // Validate KV configuration
    const kvUrl = process.env.KV_URL;
    const kvRestApiUrl = process.env.KV_REST_API_URL;
    const kvRestApiToken = process.env.KV_REST_API_TOKEN;

    if (kvRestApiUrl && !kvRestApiUrl.includes('placeholder')) {
      if (!kvRestApiUrl.includes('redis.vercel-storage.com')) {
        warnings.push('KV_REST_API_URL should be a valid Vercel KV URL');
      }
      config.kv = {
        url: kvUrl || '',
        restApiUrl: kvRestApiUrl,
        restApiToken: kvRestApiToken || '',
      };
    }

    // Validate app configuration
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !appUrl.includes('placeholder')) {
      config.app = {
        url: appUrl,
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
    };
  }

  static getMissingVariables(): string[] {
    const missing: string[] = [];
    
    for (const varName of this.REQUIRED_VARS) {
      const value = process.env[varName];
      if (!value || value.includes('placeholder') || value.includes('your_')) {
        missing.push(varName);
      }
    }

    return missing;
  }

  static getPlaceholderVariables(): string[] {
    const placeholders: string[] = [];
    
    for (const varName of [...this.REQUIRED_VARS, ...this.OPTIONAL_VARS]) {
      const value = process.env[varName];
      if (value && (value.includes('placeholder') || value.includes('your_'))) {
        placeholders.push(varName);
      }
    }

    return placeholders;
  }

  static generateEnvTemplate(): string {
    const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel KV Configuration
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

    return template;
  }
}

export function validateEnvironment(): ValidationResult {
  return EnvironmentValidator.validate();
}

export function isEnvironmentConfigured(): boolean {
  return EnvironmentValidator.validate().isValid;
}
