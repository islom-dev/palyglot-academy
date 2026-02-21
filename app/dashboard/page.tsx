'use client';

import { supabase } from '@/lib/client';
import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface RegistrationData {
    date: string;
    count: number;
}

export default function DashboardHome() {
    const [data, setData] = useState<RegistrationData[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            // Fetch only the created_at column for all students
            const { data: students, error } = await supabase
                .from('students')
                .select('created_at');

            if (error) {
                console.error('Error fetching analytics:', error.message);
                return;
            }

            if (students) {
                setTotalStudents(students.length);

                // Group students by date (YYYY-MM-DD)
                const counts: Record<string, number> = {};
                students.forEach((s) => {
                    const date = new Date(s.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                    });
                    counts[date] = (counts[date] || 0) + 1;
                });

                // Convert to array and take the last 7 days (or entries)
                const chartData = Object.entries(counts)
                    .map(([date, count]) => ({ date, count }))
                    .slice(-7);

                setData(chartData);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="p-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Аналитика</h1>
                <p className="text-gray-500 mb-8">Обзор регистрации новых студентов</p>

                {/* Metric Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium uppercase">Всего студентов</p>
                        <h2 className="text-4xl font-bold text-indigo-600 mt-2">{totalStudents}</h2>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-6">Тренд регистраций (по дням)</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#6366f1' : '#e0e7ff'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}