import { useState } from "react";
import { LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { login } from "../api";

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      localStorage.setItem("veridex_token", data.access_token);
      onLogin(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080b12] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-400/20">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to Veridex
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            AI agent runtime security control center
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#0c1019] p-7 shadow-2xl"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm text-gray-400">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-blue-400/50"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm text-gray-400">
              Password
            </label>

            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-600" />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-blue-400/50"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}