import { Meal } from '@/storage/meals';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MacroCard from './MacroCard';

export type MacroGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MacroGridProps = {
  meals: Meal[];
  goals: MacroGoals;
  onChangeGoals: () => void;
};

export default function MacroGrid({
  meals,
  goals,
  onChangeGoals,
}: MacroGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Macros</Text>

        <Pressable style={styles.changeButton} onPress={onChangeGoals}>
            <Ionicons name="pencil" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.grid}>
        <MacroCard
          label="Calories"
          value={`${totals.calories}`}
          goal={`${goals.calories}`}
          color="#ff6b6b"
        />
        <MacroCard
          label="Protein"
          value={`${totals.protein}g`}
          goal={`${goals.protein}g`}
          color="#4ecdc4"
        />
        <MacroCard
          label="Carbs"
          value={`${totals.carbs}g`}
          goal={`${goals.carbs}g`}
          color="#ffd93d"
        />
        <MacroCard
          label="Fat"
          value={`${totals.fat}g`}
          goal={`${goals.fat}g`}
          color="#6bcb77"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  }
});