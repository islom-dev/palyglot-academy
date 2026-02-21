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
        `block px-4 py-2 rounded-lg transition ${pathname === path
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-200"
        }`;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-8">My App</h2>

                <nav className="space-y-2">
                    <Link href="/dashboard" className={linkClass("/dashboard")}>
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard/ranking"
                        className={linkClass("/dashboard/ranking")}
                    >
                        Ranking
                    </Link>

                    <Link
                        href="/dashboard/top10"
                        className={linkClass("/dashboard/top10")}
                    >
                        Top 10
                    </Link>

                    {(role === "admin" || role === "teacher") && (
                        <Link
                            href="/dashboard/students"
                            className={linkClass("/dashboard/students")}
                        >
                            Students
                        </Link>
                    )}

                    {role === "admin" && (
                        <Link
                            href="/dashboard/admin"
                            className={linkClass("/dashboard/admin")}
                        >
                            Admin Controls
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-10">{children}</main>
        </div>
    );
}