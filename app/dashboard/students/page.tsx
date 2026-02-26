'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Edit, X } from 'lucide-react';
import { supabase } from '@/lib/client';

interface Student {
    id: string;
    full_name: string;
    profile_id: string;
    created_at: string;
    gender?: string;
    phone?: string;
    birth_date?: string;
    email?: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newGender, setNewGender] = useState('Мужской');
    const [newBirthDate, setNewBirthDate] = useState('');

    const fetchStudents = async () => {
        const { data } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setStudents(data);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login");

        const { error } = await supabase
            .from('students')
            .insert([{
                full_name: newName,
                email: newEmail,
                phone: newPhone,
                gender: newGender,
                birth_date: newBirthDate || null,
                profile_id: user.id
            }]);

        if (error) {
            alert(error.message);
        } else {
            setNewName('');
            setNewEmail('');
            setNewPhone('');
            setNewGender('Мужской');
            setNewBirthDate('');
            setIsModalOpen(false);
            fetchStudents();
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto bg-gray-900 rounded-2xl shadow-xl border border-orange-500/30 p-6">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-orange-500">Студенты</h1>
                        <p className="text-gray-400 text-sm">
                            Управление базой студентов центра
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-orange-500 text-black px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold shadow-lg"
                    >
                        <Plus size={18} />
                        Добавить студента
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-orange-400 text-xs uppercase border-b border-orange-500/20">
                                <th className="py-4 px-2">ФИО</th>
                                <th className="py-4 px-2">Пол</th>
                                <th className="py-4 px-2">Телефон</th>
                                <th className="py-4 px-2">Дата рождения</th>
                                <th className="py-4 px-2">Email</th>
                                <th className="py-4 px-2">Дата регистрации</th>
                                <th className="py-4 px-2 text-right">Действия</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-800">
                            {students.map((student) => (
                                <tr
                                    key={student.id}
                                    className="text-sm text-gray-300 hover:bg-gray-800 transition"
                                >
                                    <td className="py-4 px-2 font-medium">{student.full_name}</td>
                                    <td className="py-4 px-2">{student.gender || '-'}</td>
                                    <td className="py-4 px-2">{student.phone || '-'}</td>
                                    <td className="py-4 px-2">
                                        {student.birth_date
                                            ? new Date(student.birth_date).toLocaleDateString('ru-RU')
                                            : '-'}
                                    </td>
                                    <td className="py-4 px-2">{student.email || '-'}</td>
                                    <td className="py-4 px-2">
                                        {student.created_at
                                            ? new Date(student.created_at).toLocaleDateString('ru-RU')
                                            : '-'}
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex justify-end gap-3 text-gray-400">
                                            <button className="hover:text-orange-500 transition">
                                                <Eye size={18} />
                                            </button>
                                            <button className="hover:text-orange-500 transition">
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative border border-orange-500/40 text-white">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-orange-500"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-orange-500">
                            Новый студент
                        </h2>

                        <div className="space-y-4">
                            <input
                                autoFocus
                                placeholder="ФИО"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-gray-800 border border-orange-500/30 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder-gray-500"
                            />

                            <select
                                value={newGender}
                                onChange={(e) => setNewGender(e.target.value)}
                                className="w-full bg-gray-800 border border-orange-500/30 p-2.5 rounded-lg outline-none text-white"
                            >
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>

                            <input
                                type="date"
                                value={newBirthDate}
                                onChange={(e) => setNewBirthDate(e.target.value)}
                                className="w-full bg-gray-800 border border-orange-500/30 p-2.5 rounded-lg outline-none text-white"
                            />

                            <input
                                placeholder="Телефон"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full bg-gray-800 border border-orange-500/30 p-2.5 rounded-lg outline-none text-white placeholder-gray-500"
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-orange-500/30 p-2.5 rounded-lg outline-none text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-lg transition"
                            >
                                Отмена
                            </button>

                            <button
                                onClick={handleCreate}
                                className="px-5 py-2.5 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition shadow-lg"
                            >
                                Создать
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}