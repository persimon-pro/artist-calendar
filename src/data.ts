import { Artist, ShiftSlot, DayConfig, Genre, MonthData } from "./types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

export const initialArtists: Artist[] = [
  {
    id: "a1",
    name: "DJ Max",
    demand: 5,
    priority: 4,
    rate: 15000,
    genres: ["DJ"],
    availability: {},
    minShifts: 4,
    maxShifts: 10,
    telegramConnected: true,
    telegramUsername: "@djmax_official"
  },
  {
    id: "a2",
    name: "Lounge Duo",
    demand: 4,
    priority: 5,
    rate: 20000,
    genres: ["Лаунж", "Вокал"],
    availability: {},
    minShifts: 2,
    maxShifts: 8,
    telegramConnected: false
  },
  {
    id: "a3",
    name: "Sax & Beat",
    demand: 3,
    priority: 3,
    rate: 12000,
    genres: ["Инструментал"],
    availability: {},
    minShifts: 1,
    maxShifts: 5,
    telegramConnected: true,
    telegramUsername: "@sax_beat"
  },
  {
    id: "a4",
    name: "Cover Band 'RockIt'",
    demand: 5,
    priority: 5,
    rate: 50000,
    genres: ["Кавер-группа"],
    availability: {},
    minShifts: 1,
    maxShifts: 3,
    telegramConnected: false
  },
  {
    id: "a5",
    name: "MC Showman",
    demand: 4,
    priority: 4,
    rate: 25000,
    genres: ["Ведущий"],
    availability: {},
    minShifts: 2,
    maxShifts: 6,
    telegramConnected: true,
    telegramUsername: "@showman_mc"
  },
  {
    id: "a6",
    name: "DJ Spark",
    demand: 2,
    priority: 4,
    rate: 8000,
    genres: ["DJ"],
    availability: {},
    minShifts: 5,
    maxShifts: 15,
    telegramConnected: false
  },
  {
    id: "a7",
    name: "Neon Dancers",
    demand: 5,
    priority: 4,
    rate: 18000,
    genres: ["Танцы"],
    availability: {},
    minShifts: 1,
    maxShifts: 4,
    telegramConnected: true,
    telegramUsername: "@neon_dance"
  }
];

export function generateMockMonth(year: number, month: number): MonthData {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const daysInMonth = eachDayOfInterval({ start, end });

  const days: Record<string, DayConfig> = {};
  const slots: ShiftSlot[] = [];

  let slotIdCounter = 1;

  for (const date of daysInMonth) {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

    let type: DayConfig["type"] = "Weak";
    let budget = 0;

    if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3) {
      type = "Weak";
      budget = 40000;
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:00", role: "Лаунж", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:40", role: "Вокал", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "21:30", role: "DJ", assignedArtistId: null });
    } else if (dayOfWeek === 4 || dayOfWeek === 0) {
      type = "Average";
      budget = 60000;
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:00", role: "Лаунж", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:40", role: "Инструментал", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "21:30", role: "DJ", assignedArtistId: null });
    } else {
      // Friday & Saturday
      type = "Prime";
      budget = 100000;
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:00", role: "Инструментал", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "20:40", role: "Кавер-группа", assignedArtistId: null });
      slots.push({ id: `s_${slotIdCounter++}`, date: dateStr, time: "21:30", role: "Танцы", assignedArtistId: null });
    }

    days[dateStr] = { type, date: dateStr, budget };
  }

  // Populate everyone's availability to true for MVP
  initialArtists.forEach(artist => {
    daysInMonth.forEach(d => {
      artist.availability[format(d, "yyyy-MM-dd")] = Math.random() > 0.15; // 85% available
    });
  });

  return { year, month, days, slots };
}
