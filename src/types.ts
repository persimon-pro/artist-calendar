export type Genre = "DJ" | "Инструментал" | "Кавер-группа" | "Ведущий" | "Вокал" | "Лаунж" | "Танцы";

export interface Artist {
  id: string;
  name: string;
  demand: number; // 1-5
  priority: number; // 1-5
  rate: number;
  genres: Genre[];
  availability: Record<string, boolean>; // date string "YYYY-MM-DD" -> true if available
  minShifts: number;
  maxShifts: number;
  telegramConnected?: boolean;
  telegramUsername?: string;
}

export type DayType = "Weak" | "Average" | "Prime";

export interface ShiftSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // "19:00", "22:00"
  role: Genre;
  assignedArtistId: string | null;
}

export interface DayConfig {
  date: string; // YYYY-MM-DD
  type: DayType;
  budget: number;
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  days: Record<string, DayConfig>;
  slots: ShiftSlot[];
}
