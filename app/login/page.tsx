"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-orange-500">
                <h2 className="text-3xl font-bold text-orange-500 text-center mb-6">
                    Login
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-orange-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@academy.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-black/70 text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-orange-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-black/70 text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-orange-300 text-sm mt-6">
                    Don’t have an account?{" "}
                    <span
                        onClick={() => router.push("/register")}
                        className="underline cursor-pointer hover:text-orange-500"
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
}