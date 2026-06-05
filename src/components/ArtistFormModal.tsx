import React, { useState, useEffect } from 'react';
import { Artist, Genre } from '../types';
import { X } from 'lucide-react';

interface ArtistFormModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (artist: Artist) => void;
}

const GENRES: Genre[] = ["DJ", "Инструментал", "Кавер-группа", "Ведущий", "Вокал", "Лаунж", "Танцы"];

export function ArtistFormModal({ artist, isOpen, onClose, onSave }: ArtistFormModalProps) {
  const [formData, setFormData] = useState<Partial<Artist>>({});

  useEffect(() => {
    if (artist) {
      setFormData(artist);
    } else {
      setFormData({
        name: '',
        genres: [],
        demand: 3,
        priority: 3,
        rate: 10000,
        minShifts: 1,
        maxShifts: 5,
        availability: {},
        telegramConnected: false,
        telegramUsername: ''
      });
    }
  }, [artist, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreToggle = (genre: Genre) => {
    setFormData(prev => {
      const current = prev.genres || [];
      if (current.includes(genre)) {
        return { ...prev, genres: current.filter(g => g !== genre) };
      } else {
        return { ...prev, genres: [...current, genre] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newArtist: Artist = {
      id: artist ? artist.id : `a_${Date.now()}`,
      name: formData.name || '',
      genres: formData.genres || [],
      demand: formData.demand || 3,
      priority: formData.priority || 3,
      rate: formData.rate || 0,
      minShifts: formData.minShifts || 0,
      maxShifts: formData.maxShifts || 0,
      availability: formData.availability || {},
      telegramConnected: formData.telegramConnected || false,
      telegramUsername: formData.telegramUsername || ''
    };

    onSave(newArtist);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {artist ? 'Редактировать артиста' : 'Добавить артиста'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Имя артиста / Название</label>
            <input 
              required
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Жанры</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                 <button
                   key={g}
                   type="button"
                   onClick={() => handleGenreToggle(g)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                     (formData.genres || []).includes(g) 
                     ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300' 
                     : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                   }`}
                 >
                   {g}
                 </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ставка (Гонорар)</label>
               <input 
                 type="number" 
                 name="rate" 
                 value={formData.rate || 0} 
                 onChange={handleChange}
                 className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Приоритет (1-5)</label>
                <input 
                  type="number" 
                  min="1" max="5"
                  name="priority" 
                  value={formData.priority || 1} 
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Востребованность (1-5)</label>
                <input 
                  type="number" 
                  min="1" max="5"
                  name="demand" 
                  value={formData.demand || 1} 
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Смен (min)</label>
               <input 
                 type="number" 
                 name="minShifts" 
                 value={formData.minShifts || 0} 
                 onChange={handleChange}
                 className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Смен (max)</label>
               <input 
                 type="number" 
                 name="maxShifts" 
                 value={formData.maxShifts || 0} 
                 onChange={handleChange}
                 className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-2">
               <input
                 id="telegramConnected"
                 type="checkbox"
                 checked={formData.telegramConnected || false}
                 onChange={(e) => setFormData(prev => ({ ...prev, telegramConnected: e.target.checked }))}
                 className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
               />
               <label htmlFor="telegramConnected" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                 Telegram привязан
               </label>
             </div>
             {formData.telegramConnected && (
               <div>
                 <input 
                   type="text" 
                   placeholder="@username"
                   name="telegramUsername" 
                   value={formData.telegramUsername || ''} 
                   onChange={handleChange}
                   className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
             )}
          </div>
          
          <div className="pt-2 mt-auto">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
