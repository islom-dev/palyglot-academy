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

    // --- Form States ---
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newGender, setNewGender] = useState('Мужской');
    const [newBirthDate, setNewBirthDate] = useState('');
    const [newCreateDate, setNewCreateDate] = useState('');

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
                birth_date: newBirthDate || null, // Ensure empty string becomes null for Postgres date type
                profile_id: user.id
            }]);

        if (error) {
            alert(error.message);
        } else {
            // Reset fields
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
        <div className="p-6 bg-[#f8f9fa] min-h-screen">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Студенты</h1>
                        <p className="text-gray-500 text-sm">Управление базой студентов центра</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-[#6366f1] text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition"
                        >
                            <Plus size={18} />
                            <span>Добавить студента</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                                <th className="py-4 font-semibold px-2">ФИО</th>
                                <th className="py-4 font-semibold px-2">Пол</th>
                                <th className="py-4 font-semibold px-2">Телефон</th>
                                <th className="py-4 font-semibold px-2">Дата рождения</th>
                                <th className="py-4 font-semibold px-2">Email</th>
                                <th className="py-4 font-semibold px-2">Дата регистрации</th>
                                <th className="py-4 font-semibold text-right px-2">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student) => (
                                <tr key={student.id} className="text-sm text-gray-700 hover:bg-gray-50 transition">
                                    <td className="py-4 font-medium px-2">{student.full_name}</td>
                                    <td className="py-4 px-2">{student.gender || '-'}</td>
                                    <td className="py-4 px-2">{student.phone || '-'}</td>
                                    <td className="py-4 px-2">
                                        {student.birth_date ? new Date(student.birth_date).toLocaleDateString('ru-RU') : '-'}
                                    </td>
                                    <td className="py-4 px-2">{student.email || '-'}</td>
                                    <td className="py-4 px-2">
                                        {new Date(student.created_at).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex justify-end gap-3 text-gray-400">
                                            <button className="hover:text-indigo-600"><Eye size={18} /></button>
                                            <button className="hover:text-indigo-600"><Edit size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding Student */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Новый студент</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                                <input
                                    autoFocus
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Иванов Иван Иванович"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                                    <select
                                        className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                                        value={newGender}
                                        onChange={(e) => setNewGender(e.target.value)}
                                    >
                                        <option value="Мужской">Мужской</option>
                                        <option value="Женский">Женский</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                                        value={newBirthDate}
                                        onChange={(e) => setNewBirthDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата создания</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                                        value={newCreateDate}
                                        onChange={(e) => setNewCreateDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                                <input
                                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                                    placeholder="+992 000 00 00"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                                    placeholder="example@mail.ru"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}