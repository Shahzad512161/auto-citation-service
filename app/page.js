"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, ShieldCheck } from "lucide-react";
import { Btn, Card, inputCls } from "../components/ui";
import { isFirebaseConfigured } from "../lib/firebase";
import { loginWithGoogle, demoGoogleLogin, emailSignIn, emailSignUp, sendOtp, verifyOtp } from "../lib/auth";

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("google"); // google | email | otp
  const [gmail, setGmail] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const go = () => router.push("/dashboard");
  const demo = !isFirebaseConfigured;

  async function onGoogle(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      const r = await loginWithGoogle();
      if (r.demo) {
        setMode("google-demo");
      } else {
        setInfo("Signed in! Opening dashboard…");
        go();
      }
    } catch (err) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogleDemo(e) {
    e.preventDefault();
    setError("");
    try {
      demoGoogleLogin(gmail, name);
      go();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onEmail(e, signup) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (signup) {
        await emailSignUp(email, password);
      } else {
        await emailSignIn(email, password);
      }
      go();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSendOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await sendOtp(email);
      setOtpSent(true);
      setInfo(r.demo ? "Demo mode: your OTP code is 123456." : "OTP sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await verifyOtp(email, otp);
      go();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F6FFF] text-white">
          <Zap size={22} />
        </span>
        <div>
          <p className="text-xl font-extrabold leading-none">Citation Blaster</p>
          <p className="text-xs text-gray-500">One Business, 1000 Directories</p>
        </div>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-center text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Log in to blast your business everywhere.</p>

        {demo && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
            Demo mode: Firebase credentials not detected. Logins are saved locally on this browser.
          </p>
        )}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {info && <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>}

        {mode === "google" && (
          <form onSubmit={onGoogle} className="mt-6 space-y-3">
            <Btn type="submit" variant="secondary" className="w-full !py-3 text-base" disabled={busy}>
              <GoogleG /> Continue with Google
            </Btn>
            <Btn type="button" variant="secondary" className="w-full" onClick={() => setMode("email")}>
              <Mail size={18} /> Continue with Email
            </Btn>
          </form>
        )}

        {mode === "google-demo" && (
          <form onSubmit={onGoogleDemo} className="mt-6 space-y-3">
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
              Demo mode: Enter any Gmail to continue the demo.
            </p>
            <input className={inputCls} type="email" required placeholder="Your Gmail, e.g. you@gmail.com" value={gmail} onChange={(e) => setGmail(e.target.value)} />
            <input className={inputCls} placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <Btn type="submit" className="w-full">Continue as this Gmail user</Btn>
            <button type="button" className="w-full text-sm text-gray-500 underline" onClick={() => setMode("google")}>Back</button>
          </form>
        )}

        {mode === "email" && (
          <form className="mt-6 space-y-3" onSubmit={(e) => onEmail(e, false)}>
            <input className={inputCls} type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputCls} type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Btn type="submit" className="w-full" disabled={busy}>Log in with Email</Btn>
            <Btn type="button" variant="secondary" className="w-full" disabled={busy} onClick={(e) => onEmail(e, true)}>Create account (Sign up)</Btn>
            <button type="button" className="w-full text-sm font-medium text-[#0F6FFF]" onClick={() => setMode("otp")}>Use email OTP instead →</button>
            <button type="button" className="w-full text-sm text-gray-500 underline" onClick={() => setMode("google")}>Back to Google login</button>
          </form>
        )}

        {mode === "otp" && (
          <form className="mt-6 space-y-3" onSubmit={otpSent ? onVerifyOtp : onSendOtp}>
            <input className={inputCls} type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            {otpSent && <input className={inputCls} required placeholder="6-digit OTP code" value={otp} onChange={(e) => setOtp(e.target.value)} />}
            <Btn type="submit" className="w-full" disabled={busy}>{otpSent ? "Verify OTP" : "Send OTP"}</Btn>
            <button type="button" className="w-full text-sm text-gray-500 underline" onClick={() => setMode("email")}>Back to password login</button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Any Gmail account works instantly — personal or Google Workspace.
        </p>
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-gray-400">
          <ShieldCheck size={14} /> Powered by Firebase Authentication & Firestore
        </p>
      </Card>
    </main>
  );
}
