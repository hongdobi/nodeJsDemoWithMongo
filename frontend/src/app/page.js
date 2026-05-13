"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("백엔드 로그인 API 연결은 다음 단계에서 진행합니다.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.32),transparent_30%),radial-gradient(circle_at_70%_22%,rgba(129,140,248,0.34),transparent_34%),radial-gradient(circle_at_54%_52%,rgba(236,72,153,0.24),transparent_30%),radial-gradient(circle_at_42%_86%,rgba(14,165,233,0.30),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      <div className="absolute left-0 right-0 top-8 z-10 text-center">
        <p className="text-sm font-semibold tracking-[0.28em] text-cyan-100/90">
          NodeJsWithMongo
        </p>
      </div>

      <section className="relative z-10 flex w-full max-w-[360px] flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/90 shadow-[0_0_42px_rgba(103,232,249,0.25)]">
          <ProfileIcon />
        </div>

        <div className="h-10" aria-hidden="true" />

        <form className="w-full" onSubmit={handleSubmit}>
          <label className="flex h-12 items-center border border-white/35 bg-white shadow-sm">
            <span className="flex w-12 justify-center text-zinc-600">
              <UserIcon />
            </span>
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm font-medium tracking-wide text-zinc-700 outline-none placeholder:text-zinc-500"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="email"
              required
            />
          </label>

          <div className="h-4" aria-hidden="true" />

          <div className="flex h-12 items-center border border-white/35 bg-white shadow-sm">
            <span className="flex w-12 justify-center text-zinc-600">
              <LockIcon />
            </span>
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm font-medium tracking-[0.18em] text-zinc-700 outline-none placeholder:text-zinc-500"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="************"
              autoComplete="current-password"
              required
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-full w-12 cursor-pointer items-center justify-center text-zinc-500 transition hover:text-zinc-800 focus:outline-none"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="h-3" aria-hidden="true" />

          <div className="flex items-center justify-between text-[11px] text-white/85">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                className="h-3 w-3 cursor-pointer accent-slate-800"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <button
              className="cursor-pointer italic transition hover:text-white"
              type="button"
              onClick={() => setMessage("비밀번호 찾기 화면은 다음 단계에서 추가합니다.")}
            >
              Forgot Password?
            </button>
          </div>

          {message ? (
            <>
              <div className="h-3" aria-hidden="true" />
              <p className="border border-white/20 bg-white/10 px-3 py-2 text-center text-xs font-medium text-white backdrop-blur">
                {message}
              </p>
            </>
          ) : null}

          <div className="h-4" aria-hidden="true" />

          <button
            className="h-13 w-full bg-[#063763] text-xs font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-cyan-950/30 transition hover:bg-[#08477f] focus:outline-none focus:ring-3 focus:ring-white/25"
            type="submit"
          >
            Login
          </button>

          <div className="h-3" aria-hidden="true" />

          <button
            className="w-full cursor-pointer text-center text-xs font-semibold text-white/80 transition hover:text-white"
            type="button"
            onClick={() => setMessage("회원가입 화면은 다음 단계에서 추가합니다.")}
          >
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="currentColor"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-16 w-16 text-white"
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="22" r="11" stroke="currentColor" strokeWidth="4" />
      <path
        d="M14 52c3.4-10.2 10-15 18-15s14.6 4.8 18 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M6.75 10h10.5A1.75 1.75 0 0 1 19 11.75v7.5A1.75 1.75 0 0 1 17.25 21H6.75A1.75 1.75 0 0 1 5 19.25v-7.5A1.75 1.75 0 0 1 6.75 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.75 12s3.5-6 9.25-6 9.25 6 9.25 6-3.5 6-9.25 6-9.25-6-9.25-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m4 4 16 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M3 12s3.5-6 9-6c1.38 0 2.64.38 3.75.95M21 12s-3.5 6-9 6c-1.37 0-2.62-.37-3.72-.93"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M10.25 9.55A3 3 0 0 1 14.45 13.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
