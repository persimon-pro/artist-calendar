import { Artist, MonthData, ShiftSlot } from "../types";

export function autoSchedule(artists: Artist[], monthData: MonthData): MonthData {
  const newMonthData = {
    ...monthData,
    slots: monthData.slots.map(s => ({ ...s }))
  };

  const newArtists = artists.map(a => ({ ...a }));
  const artistShiftCount: Record<string, number> = {};
  newArtists.forEach(a => artistShiftCount[a.id] = 0);

  // Group slots by day so we can check daily budgets
  const slotsByDate: Record<string, ShiftSlot[]> = {};
  newMonthData.slots.forEach(slot => {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot);
  });

  // Simple heuristic: fill prime days first, then average, then weak.
  const primeDates = Object.keys(newMonthData.days).filter(d => newMonthData.days[d].type === "Prime");
  const averageDates = Object.keys(newMonthData.days).filter(d => newMonthData.days[d].type === "Average");
  const weakDates = Object.keys(newMonthData.days).filter(d => newMonthData.days[d].type === "Weak");

  const orderedDates = [...primeDates, ...averageDates, ...weakDates];

  for (const date of orderedDates) {
    const dayConfig = newMonthData.days[date];
    const slots = slotsByDate[date] || [];
    
    // Sort slots by time to assign earlier shifts first (heuristic)
    slots.sort((a, b) => a.time.localeCompare(b.time));

    let dailySpent = 0;

    for (const slot of slots) {
      if (slot.assignedArtistId) {
         // Already assigned manually, account for budget
         const artist = newArtists.find(a => a.id === slot.assignedArtistId);
         if (artist) dailySpent += artist.rate;
         continue;
      }

      // Weight multiplier based on day type
      const wDemand = dayConfig.type === "Prime" ? 3 : dayConfig.type === "Average" ? 2 : 1;
      const wPriority = dayConfig.type === "Prime" ? 1 : dayConfig.type === "Average" ? 2 : 3;

      const candidates = newArtists.filter(artist => {
        // Can they work this genre?
        if (!artist.genres.includes(slot.role)) return false;
        // Are they available?
        if (artist.availability[date] === false) return false;
        // Did they exceed max shifts?
        if (artistShiftCount[artist.id] >= artist.maxShifts) return false;
        // Could they fit budget? Or maybe allow if it's the only one
        if (dailySpent + artist.rate > dayConfig.budget * 1.5) return false; // slight overbudget allowed
        return true;
      });

      if (candidates.length > 0) {
        // Score them
        candidates.sort((a, b) => {
          const scoreA = (a.demand * wDemand) + (a.priority * wPriority);
          const scoreB = (b.demand * wDemand) + (b.priority * wPriority);
          // If tie, prefer the one with fewer shifts currently to spread it out
          if (scoreA === scoreB) {
             return artistShiftCount[a.id] - artistShiftCount[b.id];
          }
          return scoreB - scoreA;
        });

        const bestCandidate = candidates[0];
        slot.assignedArtistId = bestCandidate.id;
        dailySpent += bestCandidate.rate;
        artistShiftCount[bestCandidate.id]++;
      }
    }
  }

  // Flatten slots back
  const finalSlots: ShiftSlot[] = [];
  Object.values(slotsByDate).forEach(daySlots => finalSlots.push(...daySlots));
  newMonthData.slots = finalSlots;

  return newMonthData;
}
