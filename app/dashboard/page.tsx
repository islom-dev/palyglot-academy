'use client';

import { supabase } from '@/lib/client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

interface RegistrationData {
    date: string;
    count: number;
}

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-gray-800 animate-pulse rounded-xl" />
});

export default function DashboardHome() {
    const [data, setData] = useState<RegistrationData[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: students, error } = await supabase
                .from('students')
                .select('created_at');

            if (error) {
                console.error('Error fetching analytics:', error.message);
                return;
            }

            if (students) {
                setTotalStudents(students.length);

                const today = new Date();
                const last7Days: string[] = [];

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);

                    last7Days.push(
                        d.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                        })
                    );
                }

                const counts: Record<string, number> = {};

                students.forEach((s) => {
                    const date = new Date(s.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                    });

                    counts[date] = (counts[date] || 0) + 1;
                });

                const chartData = last7Days.map((date) => ({
                    date,
                    count: counts[date] || 0,
                }));

                setData(chartData);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-orange-500 mb-2">Аналитика</h1>
                <p className="text-gray-300 mb-8">Обзор регистрации новых студентов</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 p-6 rounded-xl border border-orange-500 shadow-lg">
                        <p className="text-sm text-orange-300 font-medium uppercase">Всего студентов</p>
                        <h2 className="text-4xl font-bold text-orange-500 mt-2">{totalStudents}</h2>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border border-orange-500 shadow-lg">
                    <h3 className="text-lg font-semibold text-orange-400 mb-6">Тренд регистраций (по дням)</h3>
                    <AnalyticsChart data={data} />
                </div>
            </div>
        </>
    );
}