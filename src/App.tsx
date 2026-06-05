import React, { useState } from 'react';
import { useAppStore } from './store';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from './utils/cn';
import { Artist, DayConfig, ShiftSlot } from './types';
import { User, Users, CalendarDays, BarChart, Settings, Play, Wand2, Info, MessageCircle, Smartphone, Plus, Trash2, Edit2, Link2, CheckCircle2 } from 'lucide-react';
import { ArtistFormModal } from './components/ArtistFormModal';

export default function App() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'calendar' | 'crm' | 'analytics' | 'telegram'>('calendar');
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);

  const handleSaveArtist = (artist: Artist) => {
    if (editingArtistId === 'new') {
      store.addArtist(artist);
    } else {
      store.updateArtist(artist);
    }
  };

  const handleDragStart = (e: React.DragEvent, artistId: string) => {
    e.dataTransfer.setData('artistId', artistId);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const artistId = e.dataTransfer.getData('artistId');
    if (artistId) {
      store.assignSlot(slotId, artistId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderCalendar = () => {
    const start = startOfMonth(new Date(store.monthData.year, store.monthData.month));
    const end = endOfMonth(start);
    const startWeek = startOfWeek(start, { weekStartsOn: 1 });
    const endWeek = endOfWeek(end, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startWeek, end: endWeek });
    const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-indigo-500" />
              Календарь Расписания
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {format(start, 'LLLL yyyy', { locale: ru })} • Drag & Drop артистов в слоты
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={store.runAutoSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors font-medium text-sm"
            >
              <Wand2 className="h-4 w-4" />
              Авто-распределение
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[1000px] h-full flex flex-col">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {weekDays.map(d => (
                <div key={d} className="text-center font-semibold text-slate-500 uppercase text-xs tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4 auto-rows-fr flex-1">
              {days.map(d => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(d, start);
                const dayConfig = store.monthData.days[dateStr];
                const slots = store.monthData.slots.filter(s => s.date === dateStr);
                
                const typeColors = {
                  Weak: "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
                  Average: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
                  Prime: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                };

                return (
                  <div 
                    key={dateStr} 
                    className={cn(
                      "rounded-xl border p-3 flex flex-col min-h-[160px] transition-colors",
                      isCurrentMonth ? (dayConfig ? typeColors[dayConfig.type] : "bg-white dark:bg-slate-900") : "opacity-40 bg-slate-50 dark:bg-slate-900"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2 group">
                      <span className={cn(
                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                        format(d, 'd') === format(new Date(), 'd') && isCurrentMonth ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {format(d, 'd')}
                      </span>
                      {dayConfig && (
                        <div className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                          {dayConfig.budget / 1000}k
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2">
                      {slots.map(slot => {
                        const artist = store.artists.find(a => a.id === slot.assignedArtistId);
                        
                        return (
                          <div 
                            key={slot.id}
                            onDrop={(e) => handleDrop(e, slot.id)}
                            onDragOver={handleDragOver}
                            className={cn(
                              "text-xs p-2 border rounded-md shadow-sm transition-all relative group",
                              artist 
                                ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800" 
                                : "bg-white border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-600"
                            )}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.time}</span>
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 truncate ml-1">{slot.role}</span>
                            </div>
                            
                            {artist ? (
                              <div className="flex justify-between items-end mt-1">
                                <span className="font-medium text-indigo-700 dark:text-indigo-400 truncate pr-2">{artist.name}</span>
                                <button 
                                  onClick={() => store.assignSlot(slot.id, null)}
                                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 bg-white dark:bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="text-slate-400 dark:text-slate-500 italic mt-1 pb-1 text-[10px]">
                                Перетащите артиста...
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArtistsSidebar = () => {
    const shiftCounts = store.artists.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {} as Record<string, number>);
    store.monthData.slots.forEach(s => {
      if (s.assignedArtistId) shiftCounts[s.assignedArtistId] = (shiftCounts[s.assignedArtistId] || 0) + 1;
    });

    return (
      <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-xl z-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            База Артистов
          </h2>
          <p className="text-xs text-slate-500 mt-1">В списке {store.artists.length} человек</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {store.artists.map(artist => {
            const count = shiftCounts[artist.id] || 0;
            const isWarning = count > artist.maxShifts;
            const isDanger = count < artist.minShifts;
            
            return (
              <div 
                key={artist.id}
                draggable
                onDragStart={(e) => handleDragStart(e, artist.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{artist.name}</h3>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {artist.genres.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded-md uppercase font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold px-2 py-1 rounded">
                    ★ {artist.priority}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span>Ставка: {artist.rate.toLocaleString()} ₽</span>
                  <div className={cn(
                    "flex gap-1 items-center font-medium",
                    isWarning ? "text-amber-500" : isDanger ? "text-indigo-400" : "text-green-500"
                  )}>
                    <span>Смен: {count}</span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span>{artist.maxShifts}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCRM = () => {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            База Артистов
          </h2>
          <button 
            onClick={() => setEditingArtistId('new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Добавить артиста
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {store.artists.map(artist => (
            <div key={artist.id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingArtistId(artist.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-slate-800 rounded-md"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => store.deleteArtist(artist.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 pr-16">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {artist.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 break-words">{artist.name}</h3>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {artist.genres.map(g => (
                      <span key={g} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-200 dark:border-slate-700 uppercase font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Приоритет</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">★ {artist.priority}/5</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Востребованность</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">★ {artist.demand}/5</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Ставка</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{artist.rate.toLocaleString()} ₽</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Смены (мин/макс)</span>
                  <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{artist.minShifts} - {artist.maxShifts}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Bot Status:
                </span>
                {artist.telegramConnected ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Привязан ({artist.telegramUsername})
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                    Не привязан
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTelegram = () => {
    return (
      <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            Интеграция с Telegram
          </h2>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2 mb-1">
                Статус бота: <span className="text-emerald-500 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>Активен</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Бот автоматически собирает доступность артистов и присылает им утвержденные смены.
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-2 items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400 font-mono text-sm pl-2">@ArtistPlannerBot</span>
              <button className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm hover:text-blue-500 transition-colors">
                <Link2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg">Доступ к системе (Приглашения)</h3>
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Артист</th>
                  <th className="p-4 font-medium">Жанр</th>
                  <th className="p-4 font-medium">Статус Telegram</th>
                  <th className="p-4 font-medium text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {store.artists.map(artist => (
                  <tr key={artist.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{artist.name}</td>
                    <td className="p-4 text-slate-500">{artist.genres.join(', ')}</td>
                    <td className="p-4">
                      {artist.telegramConnected ? (
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                          Привязан ({artist.telegramUsername})
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                          Не привязан
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!artist.telegramConnected && (
                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                          Отправить ссылку
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telegram Mini App Preview */}
        <div className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Telegram Web App</h3>
            <p className="text-xs text-slate-500">Превью интерфейса для артистов</p>
          </div>
          
          <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl flex-shrink-0 border-4 border-slate-800">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-20"></div>
            
            {/* Screen */}
            <div className="w-full h-full bg-[#1c1c1e] rounded-[2rem] overflow-hidden flex flex-col font-sans relative">
              <div className="bg-[#1c1c1e] text-white p-4 pt-8 flex items-center border-b border-white/10 z-10">
                <div className="font-semibold flex-1 text-center text-sm">Artist Planner</div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    S
                  </div>
                  <div>
                    <div className="text-white font-semibold">Neon Dancers</div>
                    <div className="text-blue-400 text-xs">Ставка: 18,000 ₽</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-white/60 text-xs mb-2 uppercase tracking-wide font-semibold">Мой календарь доступности</div>
                  <div className="text-white text-sm mb-4">Отметьте дни, когда вы готовы взять смену в этом месяце.</div>
                  
                  <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-white/50">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({length: 31}).map((_, i) => {
                      const isWeekEnd = (i + 1) % 7 === 5 || (i + 1) % 7 === 6;
                      const isSelected = i > 10 && i < 20 && !isWeekEnd;
                      return (
                        <div key={i} className={cn(
                          "aspect-square rounded-full flex items-center justify-center text-sm transition-colors",
                          isSelected ? "bg-blue-500 text-white font-bold" : "text-white/80 hover:bg-white/20"
                        )}>
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-500 hover:bg-blue-400 text-white text-center py-3 rounded-xl font-medium transition-colors text-sm">
                  Сохранить доступность
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    let totalBudget = 0;
    let totalSpent = 0;
    let assignedSlots = 0;
    
    Object.values(store.monthData.days).forEach((d) => totalBudget += (d as DayConfig).budget);
    
    store.monthData.slots.forEach(s => {
      if (s.assignedArtistId) {
        assignedSlots++;
        const artist = store.artists.find(a => a.id === s.assignedArtistId);
        if (artist) totalSpent += artist.rate;
      }
    });

    const genreCounts: Record<string, number> = {};
    store.monthData.slots.forEach(s => {
      if (s.assignedArtistId) {
        genreCounts[s.role] = (genreCounts[s.role] || 0) + 1;
      }
    });

    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <BarChart className="h-6 w-6 text-indigo-500" />
          Аналитика Месяца
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Расход Бюджета</div>
            <div className="text-3xl font-bold flex items-baseline gap-2">
              <span className={totalSpent > totalBudget ? "text-red-500" : "text-slate-800 dark:text-slate-100"}>
                {(totalSpent / 1000).toFixed(0)}k ₽
              </span>
              <span className="text-sm font-medium text-slate-400">/ {(totalBudget / 1000).toFixed(0)}k ₽</span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div 
                className={cn("h-2 rounded-full", totalSpent > totalBudget ? "bg-red-500" : "bg-indigo-500")}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Заполнение Слотов</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-2">
              {assignedSlots} <span className="text-sm font-medium text-slate-400">/ {store.monthData.slots.length}</span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${(assignedSlots / store.monthData.slots.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Востребованные Жанры</div>
            <div className="space-y-2 mt-3">
              {Object.entries(genreCounts).map(([genre, count]) => (
                <div key={genre} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{genre}</span>
                  <span className="text-slate-500 dark:text-slate-400">{count} смен</span>
                </div>
              ))}
              {Object.keys(genreCounts).length === 0 && (
                <div className="text-slate-400 text-sm italic">Пока слоты не заполнены</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex bg-slate-100 font-sans text-slate-900 selection:bg-indigo-500/30 overflow-hidden">
      <div className="w-16 flex flex-col items-center py-6 bg-slate-950 border-r border-slate-800 shrink-0 z-30">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-indigo-500/20">
          A
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-2">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all mx-auto",
              activeTab === 'calendar' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
            title="Календарь Расписания"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setActiveTab('crm')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all mx-auto",
              activeTab === 'crm' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
            title="База Артистов"
          >
            <Users className="h-5 w-5" />
          </button>

          <button 
            onClick={() => setActiveTab('telegram')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all mx-auto",
              activeTab === 'telegram' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
            title="Интеграция с Telegram"
          >
            <MessageCircle className="h-5 w-5" />
          </button>

          <div className="w-8 h-px bg-slate-800 mx-auto my-2" />

          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all mx-auto",
              activeTab === 'analytics' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
            title="Аналитика"
          >
            <BarChart className="h-5 w-5" />
          </button>
        </nav>
      </div>

      {activeTab === 'calendar' && (
        <>
          {renderCalendar()}
          {renderArtistsSidebar()}
        </>
      )}
      {activeTab === 'crm' && renderCRM()}
      {activeTab === 'telegram' && renderTelegram()}
      {activeTab === 'analytics' && renderAnalytics()}

      <ArtistFormModal 
        isOpen={editingArtistId !== null} 
        onClose={() => setEditingArtistId(null)}
        artist={editingArtistId === 'new' ? null : store.artists.find(a => a.id === editingArtistId) || null}
        onSave={handleSaveArtist}
      />
    </div>
  );
}
