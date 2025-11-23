import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from './SignUpPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

// Mock fetch
(globalThis as any).fetch = vi.fn();

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    ((globalThis as any).fetch as any).mockClear();
  });

  const renderSignUpPage = () => {
    return render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );
  };

  it('should render sign up form', () => {
    renderSignUpPage();

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', async () => {
    renderSignUpPage();

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  it('should show error for invalid email format', async () => {
    renderSignUpPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const form = emailInput.closest('form')!;
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    fireEvent.submit(form);

    const errorMessage = await screen.findByText('Please enter a valid email', { selector: '.text-red-600' });
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show error for short full name', async () => {
    renderSignUpPage();

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('should show error for invalid phone number', async () => {
    renderSignUpPage();

    const phoneInput = screen.getByPlaceholderText('Enter your phone number');
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number (10-15 digits)')).toBeInTheDocument();
    });
  });

  it('should show error for short password', async () => {
    renderSignUpPage();

    const passwordInput = screen.getByPlaceholderText('Create a password');
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByText('Password must be at least 8 characters', { selector: '.text-red-600' });
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    renderSignUpPage();

    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    renderSignUpPage();

    const passwordInput = screen.getByPlaceholderText('Create a password') as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');

    expect(passwordInput.type).toBe('password');

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    }
  });

  it('should clear error when user starts typing', async () => {
    renderSignUpPage();

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /^sign up$/i });

    // Submit to trigger error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Start typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('should submit form successfully with valid data', async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Registration successful',
        email: 'test@example.com',
      }),
    });

    renderSignUpPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '1234567890',
            password: 'password123',
          }),
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        '/verify-email?email=test%40example.com'
      );
    });
  });

  it('should show error when email already registered', async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Email already registered',
      }),
    });

    renderSignUpPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This email is already registered')).toBeInTheDocument();
    });
  });

  it('should show network error on fetch failure', async () => {
    ((globalThis as any).fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderSignUpPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Network error. Please check your connection and try again.')
      ).toBeInTheDocument();
    });
  });

  it('should redirect to Google OAuth when clicking Google sign up button', () => {
    renderSignUpPage();

    const googleButton = screen.getByRole('button', { name: /sign up with google/i });
    fireEvent.click(googleButton);

    expect(window.location.href).toContain('/auth/google');
  });

  it('should navigate to login page when clicking log in link', () => {
    renderSignUpPage();

    const loginLink = screen.getByRole('button', { name: /^log in$/i });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should disable submit button while loading', async () => {
    ((globalThis as any).fetch as any).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000))
    );

    renderSignUpPage();

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /^sign up$/i });
    fireEvent.click(submitButton);

    // Check if button is disabled while loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();
    });
  });
});
