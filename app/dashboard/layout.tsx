"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            setRole(data?.role);
        }

        loadUser();
    }, []);

    const linkClass = (path: string) =>
        `block px-4 py-2 rounded-lg font-medium transition ${pathname === path
            ? "bg-orange-500 text-black shadow-lg"
            : "text-orange-300 hover:bg-orange-600 hover:text-black"
        }`;

    return (
        <div className="flex min-h-screen bg-gray-800 text-white overflow-hidden">
            <aside className="w-64 bg-gray-900 shadow-xl p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-orange-500 mb-8">Академия</h2>

                <nav className="space-y-2 flex-1">
                    <Link href="/dashboard" className={linkClass("/dashboard")}>
                        Панель управления
                    </Link>

                    <Link href="/dashboard/ranking" className={linkClass("/dashboard/ranking")}>
                        Рейтинг
                    </Link>

                    <Link href="/dashboard/top10" className={linkClass("/dashboard/top10")}>
                        Топ 10
                    </Link>

                    {(role === "admin" || role === "teacher") && (
                        <Link
                            href="/dashboard/students"
                            className={linkClass("/dashboard/students")}
                        >
                            Студенты
                        </Link>
                    )}

                    {role === "admin" && (
                        <Link href="/dashboard/admin" className={linkClass("/dashboard/admin")}>
                            Администрирование
                        </Link>
                    )}
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/login";
                        }}
                        className="w-full py-2 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-600 transition"
                    >
                        Выйти
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-screen p-8 bg-gray-800 text-white">
                {children}
            </main>
        </div>
    );
}