import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ChevronDown, X, Mail, Phone, MessageCircle } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { login } from "../../api/clientApi";

interface LoginFormProps {
  onLogin: (role: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Administrator");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showGetHelpModal, setShowGetHelpModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const roles = [
    { value: "Administrator", label: "Administrator" },
    { value: "Staff", label: "Staff" },
    { value: "Supervisor", label: "Supervisor" }
  ];

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ username, password });
      const { access, refresh } = response.data;

      // Persist tokens for subsequent authenticated requests
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      toast.success("Login successful!", {
        description: `Welcome back! Logged in as ${role}`,
      });

      onLogin(role);
    } catch (error: any) {
      const detail = error?.response?.data?.detail || "Please check your credentials and try again.";
      toast.error("Login failed", {
        description: detail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  const handleGetHelp = () => {
    setShowGetHelpModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsResetting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Password reset email sent!", {
        description: "Check your email for instructions to reset your password.",
      });
      
      // Close modal
      setShowForgotPasswordModal(false);
    } catch (error) {
      toast.error("Failed to send password reset email", {
        description: "Please try again later.",
      });
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-white">
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[380px]">
        {/* Main Card Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Card Content */}
          <div className="px-6 sm:px-7 py-7 sm:py-8">
            {/* Title Section Inside Form */}
            <div className="text-center mb-6">
              <h1 className="text-[22px] text-gray-900 mb-1 tracking-tight" style={{ fontWeight: 600 }}>
                MSWD-PMS
              </h1>
              <p className="text-[13px] text-gray-600" style={{ fontWeight: 400 }}>
                Program Management System
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 mb-1.5">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="size-1 rounded-full bg-blue-600" />
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection - Dropdown */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="role"
                  className="text-[13px] text-gray-700"
                  style={{ fontWeight: 500 }}
                >
                  Login As
                </Label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 text-[13px] border-2 border-gray-300 rounded-lg px-3 pr-9 bg-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50 cursor-pointer hover:border-gray-400 transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {roles.map((roleOption) => (
                      <option key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1.5">
                <Label 
                  htmlFor="username" 
                  className="text-[13px] text-gray-700"
                  style={{ fontWeight: 500 }}
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  placeholder="Enter your username"
                  className={`
                    h-10 text-[13px] border-2 border-gray-300 rounded-lg px-4
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50
                    placeholder:text-gray-400 placeholder:opacity-70
                    ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-100/50' : ''}
                  `}
                  style={{ fontWeight: 400 }}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
                {errors.username && (
                  <p 
                    id="username-error" 
                    className="text-[13px] text-red-600 flex items-center gap-1.5 mt-1.5"
                    role="alert"
                    style={{ fontWeight: 400 }}
                  >
                    <svg className="size-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label 
                  htmlFor="password" 
                  className="text-[13px] text-gray-700"
                  style={{ fontWeight: 500 }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="Enter your password"
                    className={`
                      h-10 text-[13px] border-2 border-gray-300 rounded-lg px-4 pr-12
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50
                      placeholder:text-gray-400 placeholder:opacity-70
                      ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100/50' : ''}
                    `}
                    style={{ fontWeight: 400 }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {/* Show/Hide Password Icon - Properly Aligned */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p 
                    id="password-error" 
                    className="text-[13px] text-red-600 flex items-center gap-1.5 mt-1.5"
                    role="alert"
                    style={{ fontWeight: 400 }}
                  >
                    <svg className="size-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[14px] text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button - All States */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full h-10 text-[13px] rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-offset-2
                  ${isLoading
                    ? 'bg-blue-400 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-xl hover:shadow-blue-200/50 active:scale-[0.98]'
                  }
                `}
                style={{ fontWeight: 600 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Helper Text */}
            <div className="mt-8 text-center">
              <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>
                Having trouble logging in?{" "}
                <button 
                  onClick={handleGetHelp}
                  className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
                  style={{ fontWeight: 500 }}
                >
                  Get help
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
            <svg className="size-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>
              Secure Government System
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-[18px] text-white" style={{ fontWeight: 600 }}>
                Reset Password
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setResetEmail("");
                  setIsResetting(false);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <svg className="size-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-[14px] text-blue-900" style={{ fontWeight: 400 }}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label 
                    htmlFor="resetEmail" 
                    className="text-[13px] text-gray-700"
                    style={{ fontWeight: 500 }}
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@mswd.gov.ph"
                      className="h-10 text-[13px] border-2 border-gray-300 rounded-lg pl-12 pr-4
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50
                        placeholder:text-gray-400 placeholder:opacity-70"
                      style={{ fontWeight: 400 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setResetEmail("");
                      setIsResetting(false);
                    }}
                    className="flex-1 h-11 text-[15px] rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-gray-200
                      bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300"
                    style={{ fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResetting}
                    className={`
                      flex-1 h-11 text-[15px] rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-offset-2
                      ${isResetting
                        ? 'bg-blue-400 cursor-not-allowed opacity-70'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-xl hover:shadow-blue-200/50 active:scale-[0.98]'
                      }
                    `}
                    style={{ fontWeight: 600 }}
                  >
                    {isResetting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Get Help Modal */}
      {showGetHelpModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowGetHelpModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-[18px] text-white" style={{ fontWeight: 600 }}>
                Need Help?
              </h3>
              <button
                type="button"
                onClick={() => setShowGetHelpModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <p className="text-[14px] text-gray-600" style={{ fontWeight: 400 }}>
                If you're having trouble logging in, our support team is here to help you. Please contact us through any of the following methods:
              </p>

              {/* Contact Options */}
              <div className="space-y-3">
                {/* Email Support */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="bg-blue-100 rounded-lg p-2.5">
                    <Mail className="size-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                      Email Support
                    </h4>
                    <p className="text-[14px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>
                      support@mswd.gov.ph
                    </p>
                    <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>
                      Response within 24 hours
                    </p>
                  </div>
                </div>

                {/* Phone Support */}
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                  <div className="bg-green-100 rounded-lg p-2.5">
                    <Phone className="size-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                      Phone Support
                    </h4>
                    <p className="text-[14px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>
                      (02) 1234-5678
                    </p>
                    <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>
                      Mon-Fri, 8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                {/* IT Help Desk */}
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                  <div className="bg-purple-100 rounded-lg p-2.5">
                    <MessageCircle className="size-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                      IT Help Desk
                    </h4>
                    <p className="text-[14px] text-gray-600 mb-1" style={{ fontWeight: 400 }}>
                      Local 2050 / 2051
                    </p>
                    <p className="text-[13px] text-gray-500" style={{ fontWeight: 400 }}>
                      For technical issues
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="size-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-[14px] text-amber-900 mb-1" style={{ fontWeight: 600 }}>
                      Important Information
                    </h4>
                    <p className="text-[13px] text-amber-800" style={{ fontWeight: 400 }}>
                      Please have your employee ID ready when contacting support. For password resets, you'll need to verify your identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}