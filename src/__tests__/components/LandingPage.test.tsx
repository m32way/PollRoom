import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import LandingPage from "@/components/LandingPage";
import { createRoomSchema, joinRoomSchema } from "@/lib/validation";

// Mock the API calls
const mockFetch = jest.fn();

// Mock window.location
delete (window as any).location;
window.location = {
  href: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
} as any;

describe("LandingPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    window.location.href = "";
    global.fetch = mockFetch;
  });

  describe("Rendering", () => {
    it("should render the main heading", () => {
      render(<LandingPage />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Welcome to PollRoom"
      );
    });

    it("should render the subtitle", () => {
      render(<LandingPage />);
      expect(
        screen.getByText(/Create instant polls for your audience/i)
      ).toBeInTheDocument();
    });

    it("should render create room section", () => {
      render(<LandingPage />);
      expect(screen.getByText("Create a Room")).toBeInTheDocument();
      expect(screen.getByLabelText(/room name/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create room/i })
      ).toBeInTheDocument();
    });

    it("should render join room section", () => {
      render(<LandingPage />);
      expect(screen.getByText("Join a Room")).toBeInTheDocument();
      expect(screen.getByLabelText(/room code/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /join room/i })
      ).toBeInTheDocument();
    });
  });

  describe("Create Room Form", () => {
    it("should validate room name input", async () => {
      render(<LandingPage />);

      const nameInput = screen.getByLabelText(/room name/i);
      const createButton = screen.getByRole("button", { name: /create room/i });

      // Test empty name (should be valid as it's optional)
      fireEvent.click(createButton);
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/rooms/create",
          expect.any(Object)
        );
      });

      // Test name too long
      fireEvent.change(nameInput, { target: { value: "a".repeat(51) } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText("Room name must be less than 50 characters")
        ).toBeInTheDocument();
      });
    });

    it("should call create room API with valid data", async () => {
      const mockResponse = {
        success: true,
        data: {
          id: "room-123",
          code: "ABC123",
          name: "Test Room",
          created_at: "2025-01-10T10:00:00Z",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<LandingPage />);

      const nameInput = screen.getByLabelText(/room name/i);
      const createButton = screen.getByRole("button", { name: /create room/i });

      fireEvent.change(nameInput, { target: { value: "Test Room" } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/rooms/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Test Room" }),
        });
      });
    });

    it("should handle create room API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: "Failed to create room",
        }),
      } as Response);

      render(<LandingPage />);

      const createButton = screen.getByRole("button", { name: /create room/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to create room")).toBeInTheDocument();
      });
    });

    it("should show loading state during room creation", async () => {
      mockFetch.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LandingPage />);

      const createButton = screen.getByRole("button", { name: /create room/i });
      fireEvent.click(createButton);

      expect(screen.getByText("Creating...")).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });
  });

  describe("Join Room Form", () => {
    it("should validate room code format", async () => {
      render(<LandingPage />);

      const codeInput = screen.getByLabelText(/room code/i);
      const joinButton = screen.getByRole("button", { name: /join room/i });

      // Test invalid code length
      fireEvent.change(codeInput, { target: { value: "ABC12" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(
          screen.getByText("Room code must be exactly 6 characters")
        ).toBeInTheDocument();
      });

      // Clear previous error
      fireEvent.change(codeInput, { target: { value: "" } });

      // Test invalid characters (special characters)
      fireEvent.change(codeInput, { target: { value: "ABC-12" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Room code must contain only uppercase letters and numbers"
          )
        ).toBeInTheDocument();
      });
    });

    it("should call join room API with valid code", async () => {
      const mockResponse = {
        success: true,
        data: {
          id: "room-123",
          code: "ABC123",
          name: "Test Room",
          expires_at: "2025-01-11T10:00:00Z",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<LandingPage />);

      const codeInput = screen.getByLabelText(/room code/i);
      const joinButton = screen.getByRole("button", { name: /join room/i });

      fireEvent.change(codeInput, { target: { value: "ABC123" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/rooms/ABC123", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      });
    });

    it("should handle room not found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: "Room not found",
          details: "No room exists with this code",
        }),
      } as Response);

      render(<LandingPage />);

      const codeInput = screen.getByLabelText(/room code/i);
      const joinButton = screen.getByRole("button", { name: /join room/i });

      fireEvent.change(codeInput, { target: { value: "ABC123" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(screen.getByText("Room not found")).toBeInTheDocument();
      });
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should be mobile responsive", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<LandingPage />);

      const container = screen.getByTestId("landing-page");
      expect(container).toHaveClass("px-4", "py-8");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<LandingPage />);

      expect(screen.getByLabelText(/room name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/room code/i)).toBeInTheDocument();
    });

    it("should have proper form associations", () => {
      render(<LandingPage />);

      const nameInput = screen.getByLabelText(/room name/i);
      const codeInput = screen.getByLabelText(/room code/i);

      expect(nameInput).toHaveAttribute("id");
      expect(codeInput).toHaveAttribute("id");
    });
  });
});
