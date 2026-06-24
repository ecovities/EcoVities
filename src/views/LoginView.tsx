import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4">
        <span className="material-symbols-rounded text-3xl icon-filled">eco</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">EcoVities</h1>
      <p className="text-sm text-gray-500 mb-8">Sign in to your wallet</p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface-container text-gray-900 px-5 py-3.5 rounded-2xl outline-none w-full text-[15px] placeholder-gray-500"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface-container text-gray-900 px-5 py-3.5 rounded-2xl outline-none w-full text-[15px] placeholder-gray-500"
        />

        {error && (
          <p className="text-error text-[13px] px-1" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full bg-primary text-white py-3.5 rounded-full text-[15px] font-medium shadow-md hover:opacity-90 transition active:scale-95 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
