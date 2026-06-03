import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const MEALS_KEY = 'meals';

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyMealSummary = {
  date: string;
  totals: MacroTotals;
  mealCount: number;
};

export type MacroMetric = keyof MacroTotals;

const emptyTotals = (): MacroTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

export const getMealDateKey = (createdAt: string): string => {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = (): string =>
  getMealDateKey(new Date().toISOString());

export const getMeals = async (): Promise<Meal[]> => {
  const data = await AsyncStorage.getItem(MEALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTodayMeals = async (): Promise<Meal[]> => {
  const meals = await getMeals();
  const today = getTodayDateKey();
  return meals.filter((meal) => getMealDateKey(meal.createdAt) === today);
};

export const getDailyMealSummaries = async (): Promise<DailyMealSummary[]> => {
  const meals = await getMeals();
  const today = getTodayDateKey();
  const summaries = new Map<string, DailyMealSummary>();

  meals.forEach((meal) => {
    const date = getMealDateKey(meal.createdAt);

    if (date === today) {
      return;
    }

    const summary = summaries.get(date) ?? {
      date,
      totals: emptyTotals(),
      mealCount: 0,
    };

    summary.totals.calories += meal.calories;
    summary.totals.protein += meal.protein;
    summary.totals.carbs += meal.carbs;
    summary.totals.fat += meal.fat;
    summary.mealCount += 1;

    summaries.set(date, summary);
  });

  return Array.from(summaries.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
};

export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals]));
  return newMeal;
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};

export const deleteMealsByDate = async (date: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter(
    (meal) => getMealDateKey(meal.createdAt) !== date,
  );
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};

export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
