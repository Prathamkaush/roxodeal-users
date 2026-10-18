"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, setSession } from "@/lib/api";
import {
  emailSchema,
  loginSchema,
  registrationSchema,
  verificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/auth-validation";
import { Brand } from "./brand";
import { Button } from "./ui/button";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";
type Field =
  "name" | "phone" | "email" | "password" | "confirmPassword" | "code";
const emptyFields = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  code: "",
};
const schemas = {
  login: loginSchema,
  register: registrationSchema,
  verify: verificationSchema,
  forgot: forgotPasswordSchema,
  reset: resetPasswordSchema,
};

export function AuthForm({
  role = "buyer",
  register = false,
}: {
  role?: "buyer" | "seller" | "admin";
  register?: boolean;
}) {
  const router = useRouter(),
    params = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("token") ? "reset" : register ? "register" : "login",
  );
  const [values, setValues] = useState({ ...emptyFields });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false),
    [showConfirmation, setShowConfirmation] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("roxodeal-email-cooldowns") || "{}",
      );
      setCooldowns(
        Object.fromEntries(
          Object.entries(stored).filter(
            ([, value]) =>
              typeof value === "number" &&
              Number.isFinite(value) &&
              value > Date.now(),
          ),
        ) as Record<string, number>,
      );
    } catch {}
  }, []);
  useEffect(() => {
    if (!Object.values(cooldowns).some((deadline) => deadline > Date.now()))
      return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (!Object.values(cooldowns).some((deadline) => deadline > Date.now()))
        clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldowns]);
  const cooldownKey = (purpose: string) =>
    purpose + ":" + values.email.trim().toLowerCase();
  const remaining = (purpose: string) =>
    Math.max(
      0,
      Math.ceil(
        ((cooldowns[cooldownKey(purpose)] || 0) - (now || Date.now())) / 1000,
      ),
    );
  const verificationRemaining = remaining("verification"),
    resetRemaining = remaining("reset");
  const countdown = (seconds: number) =>
    seconds > 60
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : `${seconds}s`;
  function startCooldown(purpose: string, seconds = 60) {
    const deadline =
      Date.now() + Math.max(1, Math.min(3600, Math.ceil(seconds))) * 1000;
    setNow(Date.now());
    setCooldowns((previous) => {
      const next = { ...previous, [cooldownKey(purpose)]: deadline };
      try {
        sessionStorage.setItem(
          "roxodeal-email-cooldowns",
          JSON.stringify(next),
        );
      } catch {}
      return next;
    });
  }

  function change(field: Field, value: string) {
    if (field === "phone")
      value =
        (value.startsWith("+") ? "+" : "") +
        value.replace(/\D/g, "").slice(0, 15);
    if (field === "code") value = value.replace(/\D/g, "").slice(0, 6);
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  }
  function switchMode(next: Mode, notice = "") {
    setMode(next);
    setValues((previous) => ({ ...emptyFields, email: previous.email }));
    setFieldErrors({});
    setError("");
    setMessage(notice);
    setShowPassword(false);
    setShowConfirmation(false);
  }
  function validate() {
    const parsed = schemas[mode].safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return null;
    }
    setFieldErrors({});
    return parsed.data;
  }
  function fieldError(field: Field) {
    return fieldErrors[field] ? (
      <small
        id={`auth-${mode}-${field}-error`}
        className="ms-error"
        role="alert"
      >
        {fieldErrors[field]}
      </small>
    ) : null;
  }
  const inputProps = (field: Field) => ({
    id: `auth-${mode}-${field}`,
    name: field,
    value: values[field],
    disabled: busy,
    "aria-invalid": !!fieldErrors[field],
    "aria-describedby": fieldErrors[field]
      ? `auth-${mode}-${field}-error`
      : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      change(field, event.target.value),
  });

  async function sendCode() {
    if (busy || verificationRemaining > 0) return;
    const parsed = emailSchema.safeParse(values.email);
    if (!parsed.success) {
      setFieldErrors({ email: parsed.error.issues[0].message });
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    startCooldown("verification");
    try {
      const response = await api("/auth/email/send", {
        method: "POST",
        body: JSON.stringify({ email: parsed.data }),
      });
      setMessage(response.message);
      startCooldown("verification", response.resendAfter || 60);
    } catch (e) {
      setError((e as Error).message);
      if (e instanceof ApiError && e.retryAfter)
        startCooldown("verification", e.retryAfter);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = validate();
    if (!data) return;
    if (mode === "forgot" && resetRemaining > 0) return;
    setBusy(true);
    try {
      if (mode === "register") {
        const { name, phone, email, password } =
          registrationSchema.parse(values);
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            phone,
            email,
            password,
            role: role.toUpperCase(),
          }),
        });
        switchMode(
          "verify",
          "Account created. Send a verification code to your email, then enter it below.",
        );
      } else if (mode === "verify") {
        await api("/auth/email/verify", {
          method: "POST",
          body: JSON.stringify(verificationSchema.parse(values)),
        });
        switchMode(
          "login",
          "Email verified. Sign in with your email and password.",
        );
      } else if (mode === "forgot") {
        startCooldown("reset");
        const response = await api("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify(forgotPasswordSchema.parse(values)),
        });
        setMessage(
          response.message +
            " Check your inbox and spam folder for the reset link.",
        );
        startCooldown("reset", response.resendAfter || 60);
      } else if (mode === "reset") {
        if (!params.get("token"))
          throw new Error(
            "Open the password reset link from your email first.",
          );
        const { password } = resetPasswordSchema.parse(values);
        const response = await api("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ password, token: params.get("token") }),
        });
        switchMode("login", response.message);
        router.replace("/login");
      } else {
        const result = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify(loginSchema.parse(values)),
        });
        if (result.user.role.toLowerCase() !== role)
          throw new Error(
            "Use the " +
              result.user.role.toLowerCase() +
              " frontend to sign in.",
          );
        setSession(result);
        setValues({ ...emptyFields });
        const next = params.get("next");
        router.push(
          next &&
            (next.startsWith("/" + role + "/") ||
              /^\/(products|suppliers)\/[^/]+$|^\/(feedback|reviews|contact)$/.test(
                next,
              ))
            ? next
            : "/" + role + "/dashboard",
        );
      }
    } catch (e) {
      const text = (e as Error).message;
      if (mode === "forgot" && e instanceof ApiError && e.retryAfter)
        startCooldown("reset", e.retryAfter);
      if (text.includes("Email verification is required"))
        switchMode(
          "verify",
          "Verify your email before signing in. Request a code below.",
        );
      else setError(text);
    } finally {
      setBusy(false);
    }
  }
  function passwordField(confirm = false) {
    const field: Field = confirm ? "confirmPassword" : "password",
      visible = confirm ? showConfirmation : showPassword;
    const label = confirm
      ? "Confirm password"
      : mode === "reset"
        ? "New password"
        : "Password";
    return (
      <div className="ms-field" key={`${mode}-${field}`}>
        <label htmlFor={`auth-${mode}-${field}`}>{label}</label>
        <div className="rx-password-input">
          <input
            {...inputProps(field)}
            type={visible ? "text" : "password"}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            maxLength={128}
          />
          <button
            type="button"
            className="rx-password-toggle"
            aria-label={`${visible ? "Hide" : "Show"} ${confirm ? "confirm password" : "password"}`}
            aria-pressed={visible}
            disabled={busy}
            onClick={() =>
              confirm
                ? setShowConfirmation(!visible)
                : setShowPassword(!visible)
            }
          >
            {visible ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>
        {fieldError(field)}
        {!confirm && mode !== "login" && (
          <small className="rx-auth-hint">
            Use 10–128 characters. Letters, numbers and symbols are allowed.
          </small>
        )}
      </div>
    );
  }
  const titles = {
    register: "Create your Roxodeal account",
    verify: "Verify your email",
    forgot: "Forgot your password?",
    reset: "Choose a new password",
    login: "Sign in to Roxodeal",
  };
  const descriptions = {
    verify:
      "Enter the six-digit code sent to your email. It expires after 10 minutes.",
    forgot:
      "Enter your registered email address. We’ll email you a secure link to reset your password.",
    reset: "Enter and confirm your new password, then sign in again.",
  };
  return (
    <main className="ms-auth rx-auth-background">
      <section className="ms-card ms-auth-card">
        <Brand />
        <h1>{titles[mode]}</h1>
        {mode in descriptions && (
          <p className="rx-auth-description">
            {descriptions[mode as keyof typeof descriptions]}
          </p>
        )}
        <form key={mode} className="ms-form" onSubmit={submit} noValidate>
          {mode === "register" && (
            <>
              <div className="ms-field">
                <label htmlFor={`auth-${mode}-name`}>Name</label>
                <input
                  {...inputProps("name")}
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                />
                {fieldError("name")}
              </div>
              <div className="ms-field">
                <label htmlFor={`auth-${mode}-phone`}>Mobile number</label>
                <input
                  {...inputProps("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+919876543210"
                  maxLength={16}
                />
                {fieldError("phone")}
              </div>
            </>
          )}
          {mode !== "reset" && (
            <div className="ms-field">
              <label htmlFor={`auth-${mode}-email`}>
                {mode === "verify" ? "Email address" : "Email"}
              </label>
              <input
                {...inputProps("email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
              />
              {fieldError("email")}
            </div>
          )}
          {mode === "verify" ? (
            <>
              <div className="ms-field">
                <label htmlFor={`auth-${mode}-code`}>Verification code</label>
                <input
                  {...inputProps("code")}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="6-digit email code"
                />
                {fieldError("code")}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy || verificationRemaining > 0}
                onClick={sendCode}
              >
                {verificationRemaining > 0
                  ? `Resend in ${countdown(verificationRemaining)}`
                  : "Send email verification code"}
              </Button>
              <small className="rx-auth-hint">
                Wait 60 seconds between requests. Maximum 5 verification emails
                per hour.
              </small>
            </>
          ) : (
            mode !== "forgot" && (
              <>
                {passwordField()}
                {(mode === "register" || mode === "reset") &&
                  passwordField(true)}
              </>
            )
          )}
          {error && (
            <p className="ms-error" role="alert">
              {error}
            </p>
          )}
          {message && <p role="status">{message}</p>}
          <Button
            type="submit"
            disabled={busy || (mode === "forgot" && resetRemaining > 0)}
          >
            {busy
              ? "Please wait…"
              : mode === "register"
                ? "Create account"
                : mode === "verify"
                  ? "Verify email"
                  : mode === "forgot"
                    ? resetRemaining > 0
                      ? `Resend in ${countdown(resetRemaining)}`
                      : "Send reset link"
                    : mode === "reset"
                      ? "Save new password"
                      : "Sign in"}
          </Button>
        </form>
        <div className="ms-table-actions">
          {mode === "login" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => switchMode("forgot")}
              >
                Forgot password?
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => switchMode("verify")}
              >
                Verify email
              </button>
            </>
          )}
          {role !== "admin" && mode !== "register" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => switchMode("register")}
            >
              Create an account
            </button>
          )}
          {mode !== "login" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => switchMode("login")}
            >
              Back to sign in
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
