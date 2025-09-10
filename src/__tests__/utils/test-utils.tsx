import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
  },
}));

// Mock KV client
jest.mock("@/lib/kv", () => ({
  getKvClientSafe: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  })),
  SessionManager: {
    createSession: jest.fn(),
    getSession: jest.fn(),
    updateSessionActivity: jest.fn(),
    deleteSession: jest.fn(),
  },
  RateLimiter: {
    checkRateLimit: jest.fn(() =>
      Promise.resolve({ allowed: true, remaining: 10 })
    ),
  },
}));

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock crypto for UUID generation
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid-123",
  },
});

// Mock window.matchMedia for responsive design tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

export * from "@testing-library/react";
export { customRender as render };

// Simple test to ensure the test utilities work
describe("Test Utils", () => {
  it("should export custom render function", () => {
    expect(customRender).toBeDefined();
    expect(typeof customRender).toBe("function");
  });

  it("should have mocked fetch", () => {
    expect(global.fetch).toBeDefined();
    expect(jest.isMockFunction(global.fetch)).toBe(true);
  });

  it("should have mocked crypto", () => {
    expect(global.crypto).toBeDefined();
    expect(global.crypto.randomUUID()).toBe("test-uuid-123");
  });
});
