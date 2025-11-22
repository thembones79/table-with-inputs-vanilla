export type ExerciseEntry = {
  id: number;
  date: string;
  exercise: string;
  reps: number;
  duration_min: number;
  achievement: string;
  calories_burned: number;
  heart_rate_avg: number;
};

export type Decimal = "." | ",";

export type TStore = {
  data: ExerciseEntry[];
  payload?: string;
  decimal: Decimal;
  locked: boolean;
};

export const store: TStore = {
  data: [],
  decimal: ",",
  payload: undefined,
  locked: false,
};
