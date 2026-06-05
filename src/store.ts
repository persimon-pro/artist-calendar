import { useState } from 'react';
import { Artist, MonthData } from './types';
import { initialArtists, generateMockMonth } from './data';
import { autoSchedule } from './utils/scheduler';

export function useAppStore() {
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  
  const today = new Date();
  const [monthData, setMonthData] = useState<MonthData>(() => generateMockMonth(today.getFullYear(), today.getMonth()));

  const assignSlot = (slotId: string, artistId: string | null) => {
    setMonthData(prev => {
      const newSlots = prev.slots.map(s => s.id === slotId ? { ...s, assignedArtistId: artistId } : s);
      return { ...prev, slots: newSlots };
    });
  };

  const runAutoSchedule = () => {
    const updated = autoSchedule(artists, monthData);
    setMonthData(updated);
  };

  const updateArtist = (updated: Artist) => {
    setArtists(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const addArtist = (artist: Artist) => {
    setArtists(prev => [...prev, artist]);
  };

  const deleteArtist = (id: string) => {
    setArtists(prev => prev.filter(a => a.id !== id));
    setMonthData(prev => {
      const newSlots = prev.slots.map(s => s.assignedArtistId === id ? { ...s, assignedArtistId: null } : s);
      return { ...prev, slots: newSlots };
    });
  };
  
  return {
    artists,
    monthData,
    assignSlot,
    runAutoSchedule,
    updateArtist,
    addArtist,
    deleteArtist,
    setMonthData
  };
}
