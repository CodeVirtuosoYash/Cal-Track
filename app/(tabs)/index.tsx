import CopyButton from '@/components/CopyButton';
import MacroGrid, { MacroGoals } from '@/components/Macrogrid';
import RecentMeals from '@/components/RecentMeals';
import ReminderToggle from '@/components/ReminderToggle';
import ShareButton from '@/components/ShareButton';
import { getTodayMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import HomeHeader from '../../components/homeHeader';

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });

  const updateGoal = (key: keyof MacroGoals, value: string) => {
    setGoals((prevGoals) => ({
      ...prevGoals,
      [key]: Number(value) || 0,
    }));
  };

  const loadMeals = async () => {
    const data = await getTodayMeals();
    setMeals(data);
    console.log('Loaded meals:', data);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Cal Track</Text>

      <ShareButton meals={meals} />
      <HomeHeader />

      <MacroGrid
        meals={meals}
        goals={goals}
        onChangeGoals={() => setIsGoalModalOpen(true)}
      />

      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={loadMeals} />

      <Modal
        visible={isGoalModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGoalModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Macro Goals</Text>

            <GoalInput
              label="Calories"
              value={goals.calories}
              onChange={(value) => updateGoal('calories', value)}
            />

            <GoalInput
              label="Protein"
              value={goals.protein}
              onChange={(value) => updateGoal('protein', value)}
              suffix="g"
            />

            <GoalInput
              label="Carbs"
              value={goals.carbs}
              onChange={(value) => updateGoal('carbs', value)}
              suffix="g"
            />

            <GoalInput
              label="Fat"
              value={goals.fat}
              onChange={(value) => updateGoal('fat', value)}
              suffix="g"
            />

            <Pressable
              style={styles.saveButton}
              onPress={() => setIsGoalModalOpen(false)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

type GoalInputProps = {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: string) => void;
};

function GoalInput({ label, value, suffix, onChange }: GoalInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Text>

      <TextInput
        value={`${value}`}
        onChangeText={onChange}
        keyboardType="numeric"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
