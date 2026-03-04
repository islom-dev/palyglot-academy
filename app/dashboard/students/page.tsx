'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, Eye, Edit, X, Loader2 } from 'lucide-react';
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
    // Состояния данных
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Состояния формы (новый студент)
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newGender, setNewGender] = useState('Мужской');
    const [newBirthDate, setNewBirthDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Функция загрузки данных (стабильная благодаря useCallback)
    const fetchStudents = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setStudents(data);
        } catch (error: any) {
            console.error('Ошибка:', error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Эффект первичной загрузки
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Фильтрация "на лету" (без useEffect, что убирает ошибку setState)
    const filteredStudents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return students.filter((s) =>
            s.full_name.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query) ||
            s.phone?.includes(query)
        );
    }, [students, searchQuery]);

    // Создание студента
    const handleCreate = async () => {
        if (!newName.trim()) return alert("Введите ФИО");

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Сессия не найдена. Пожалуйста, войдите снова.");

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

            if (error) throw error;

            // Сброс и закрытие
            setNewName('');
            setNewEmail('');
            setNewPhone('');
            setNewGender('Мужской');
            setNewBirthDate('');
            setIsModalOpen(false);

            // Обновляем список
            await fetchStudents();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-orange-500/30 p-6">

                {/* Шапка */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-orange-500">Студенты</h1>
                        <p className="text-gray-400 text-sm">Всего записей: {students.length}</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-orange-500 text-black px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-bold shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        Добавить студента
                    </button>
                </div>

                {/* Поиск */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск по имени, email или телефону..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-orange-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white transition-all placeholder-gray-500"
                    />
                </div>

                {/* Таблица */}
                <div className="overflow-x-auto min-h-75">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-orange-500">
                            <Loader2 className="animate-spin" size={40} />
                            <p className="text-gray-400 animate-pulse">Загрузка данных...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-orange-400 text-xs uppercase tracking-wider border-b border-orange-500/20">
                                    <th className="py-4 px-3">ФИО</th>
                                    <th className="py-4 px-3">Пол</th>
                                    <th className="py-4 px-3">Телефон</th>
                                    <th className="py-4 px-3">Дата рождения</th>
                                    <th className="py-4 px-3">Email</th>
                                    <th className="py-4 px-3">Регистрация</th>
                                    <th className="py-4 px-3 text-right">Действия</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-800">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="text-sm text-gray-300 hover:bg-orange-500/5 transition-colors group">
                                        <td className="py-4 px-3 font-semibold text-white">{student.full_name}</td>
                                        <td className="py-4 px-3">{student.gender || '-'}</td>
                                        <td className="py-4 px-3 font-mono">{student.phone || '-'}</td>
                                        <td className="py-4 px-3">
                                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString('ru-RU') : '-'}
                                        </td>
                                        <td className="py-4 px-3">{student.email || '-'}</td>
                                        <td className="py-4 px-3 text-gray-500">
                                            {student.created_at ? new Date(student.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-4 px-3">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 transition" title="Просмотр">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-gray-700 rounded-lg text-orange-400 transition" title="Редактировать">
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && filteredStudents.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">Студенты не найдены</p>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-orange-500 hover:underline mt-2">
                                    Очистить поиск
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-orange-500/40 text-white">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-8 text-orange-500 flex items-center gap-2">
                            <Plus className="text-orange-500" />
                            Новый студент
                        </h2>

                        <div className="grid gap-5">
                            <div className="space-y-1">
                                <label className="text-xs text-orange-400 uppercase font-bold ml-1">ФИО</label>
                                <input
                                    autoFocus
                                    placeholder="Иванов Иван Иванович"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-gray-800 border border-orange-500/20 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder-gray-600 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-orange-400 uppercase font-bold ml-1">Пол</label>
                                    <select
                                        value={newGender}
                                        onChange={(e) => setNewGender(e.target.value)}
                                        className="w-full bg-gray-800 border border-orange-500/20 p-3 rounded-xl outline-none text-white appearance-none cursor-pointer"
                                    >
                                        <option value="Мужской">Мужской</option>
                                        <option value="Женский">Женский</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-orange-400 uppercase font-bold ml-1">Дата рождения</label>
                                    <input
                                        type="date"
                                        value={newBirthDate}
                                        onChange={(e) => setNewBirthDate(e.target.value)}
                                        className="w-full bg-gray-800 border border-orange-500/20 p-3 rounded-xl outline-none text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-orange-400 uppercase font-bold ml-1">Телефон</label>
                                <input
                                    placeholder="+7 (999) 000-00-00"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    className="w-full bg-gray-800 border border-orange-500/20 p-3 rounded-xl outline-none text-white placeholder-gray-600"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-orange-400 uppercase font-bold ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="example@mail.ru"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-orange-500/20 p-3 rounded-xl outline-none text-white placeholder-gray-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-2 text-gray-400 font-bold hover:text-white transition"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-orange-500 text-black font-black rounded-xl hover:bg-orange-600 transition shadow-xl disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                {isSubmitting ? 'Создание...' : 'СОЗДАТЬ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}