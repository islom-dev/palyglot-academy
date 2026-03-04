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
            const message = error.message === "Invalid login credentials"
                ? "Неверный email или пароль"
                : error.message;

            setError(message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-orange-500">
                <h2 className="text-3xl font-bold text-orange-500 text-center mb-6">
                    Вход в систему
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-orange-400 mb-1">
                            Электронная почта
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="Введите ваш email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-black/70 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-orange-400 mb-1">
                            Пароль
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-black/70 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>
            </div>
        </div>
    );
}