import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.location
delete (window as any).location;
window.location = { href: "" } as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch
(globalThis as any).fetch = vi.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    ((globalThis as any).fetch as any).mockClear();
    localStorageMock.clear();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );
  };

  it("should render login form", () => {
    renderLoginPage();

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^log in$/i }),
    ).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    renderLoginPage();

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("should show error for invalid email format", async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const form = emailInput.closest("form")!;
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    fireEvent.submit(form);

    const errorMessage = await screen.findByText("Please enter a valid email", {
      selector: ".text-red-600",
    });
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show error for short password", async () => {
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "short" } });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });
  });

  it("should toggle password visibility", () => {
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector("button");

    expect(passwordInput.type).toBe("password");

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe("text");

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe("password");
    }
  });

  it("should clear errors when user starts typing", async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /^log in$/i });

    // Submit to trigger error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    // Start typing
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await waitFor(() => {
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });
  });

  it("should login successfully as passenger and navigate to dashboard", async () => {
    const mockResponse = {
      message: "Sign in successful",
      accessToken: "jwt-token-123",
      user: {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        phoneNumber: "1234567890",
        role: "passenger",
        status: "active",
      },
    };

    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/signin"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );
      expect(localStorageMock.getItem("accessToken")).toBe("jwt-token-123");
      expect(localStorageMock.getItem("user")).toBe(
        JSON.stringify(mockResponse.user),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should login successfully as admin and navigate to admin page", async () => {
    const mockResponse = {
      message: "Sign in successful",
      accessToken: "jwt-token-admin",
      user: {
        id: "1",
        email: "admin@example.com",
        fullName: "Admin User",
        phoneNumber: "1234567890",
        role: "admin",
        status: "active",
      },
    };

    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/admin/bus-operations/locations",
      );
    });
  });

  it("should show server error on failed login", async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Invalid email or password",
      }),
    });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpassword" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("should show network error on fetch failure", async () => {
    ((globalThis as any).fetch as any).mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Network error. Please check your connection and try again.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("should clear server error when user starts typing", async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Invalid email or password",
      }),
    });

    renderLoginPage();

    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpassword" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });

    // Start typing again
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "newpassword" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Invalid email or password"),
      ).not.toBeInTheDocument();
    });
  });

  it("should navigate to forgot password page", () => {
    renderLoginPage();

    const forgotPasswordLink = screen.getByRole("button", {
      name: /forgot password/i,
    });
    fireEvent.click(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("should navigate to sign up page", () => {
    renderLoginPage();

    const signUpLink = screen.getByRole("button", { name: /^sign up$/i });
    fireEvent.click(signUpLink);

    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("should redirect to Google OAuth when clicking Google login button", () => {
    renderLoginPage();

    const googleButton = screen.getByRole("button", {
      name: /log in with google/i,
    });
    fireEvent.click(googleButton);

    expect(window.location.href).toContain("/auth/google");
  });

  it("should disable submit button while loading", async () => {
    ((globalThis as any).fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000),
        ),
    );

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    // Check if button is disabled while loading
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /logging in/i }),
      ).toBeDisabled();
    });
  });

  it("should show default server error message when no message provided", async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Login failed. Please check your credentials."),
      ).toBeInTheDocument();
    });
  });
});
