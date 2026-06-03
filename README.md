# Cal Track

Cal Track is a React Native nutrition tracker built with Expo. It helps users log meals, track daily macros, review previous days, and keep meal logging visible through reminders, sharing, and quick copy actions.

The app is designed around one simple daily workflow: add meals throughout the day, watch the current macro totals update, and then let the app separate older meals into history when the calendar day changes.

## What The App Does

- Tracks four daily nutrition metrics: calories, protein, carbs, and fat.
- Lets users add meals with a name and macro values.
- Shows the current day's totals against editable macro goals.
- Keeps recent meals visible on the home screen.
- Stores meal data locally with AsyncStorage.
- Automatically treats a new calendar day as a fresh tracker.
- Shows past daily totals on a History page.
- Allows previous day cards to be deleted by date.
- Includes a chart for comparing past days by calories, protein, carbs, or fat.
- Supports meal reminders for lunch and dinner.
- Includes copy and share actions for logged meal data.

## Main Screens

### Home

The Home tab is the main daily dashboard. It shows the Cal Track header, today's macro totals, editable macro goals, reminder controls, copy/share actions, and a recent meals list.

Only meals from the current local date are counted here. This means the dashboard resets naturally when the day changes, while older meals remain available in history.

### Add Meal

The Add Meal tab contains the meal entry form. A user can enter:

- Meal name
- Calories
- Protein
- Carbs
- Fat

When a meal is saved, the app stores it with a timestamp and returns the user to the home screen.

### All Meals

The All Meals tab shows every stored meal record. Individual meals can be deleted, and there is also a clear-all action for removing all stored meals.

### History

The History tab summarizes previous days. Each past day appears as a rectangular card containing:

- Date
- Number of meals logged
- Total calories
- Total protein
- Total carbs
- Total fat

Each card has a delete button that removes all meals for that date. At the top of the page, a horizontal bar chart compares daily totals. The chart can switch between calories, protein, carbs, and fat through the metric dropdown.

## Project Structure

```text
app/
  _layout.tsx           Root Expo Router stack layout
  (tabs)/
    _layout.tsx         Bottom tab navigation
    index.tsx           Home dashboard
    add-meal.tsx        Meal entry screen
    meals.tsx           All meals screen
    history.tsx         Past daily summaries

components/
  Macrogrid.tsx         Macro summary grid
  MacroCard.tsx         Individual macro total card
  RecentMeals.tsx       Recent meal list
  MealItem.tsx          Single meal row with delete behavior
  ReminderToggle.tsx    Meal reminder toggle
  ShareButton.tsx       Share logged meals
  CopyButton.tsx        Copy logged meals
  homeHeader.tsx        Home screen header content

storage/
  meals.ts              AsyncStorage meal persistence and daily summaries

styles/
  global.ts             Shared colors and global styles

utils/
  notifications.ts      Expo notification permission and reminder helpers
```

## Data Model

Meals are stored locally in AsyncStorage under a single `meals` key. Each meal contains:

```ts
{
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}
```

The `createdAt` timestamp is used to group meals by local calendar date. The Home screen filters meals to today's date, while the History screen groups older meals into daily summaries.

## Tech Stack

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- AsyncStorage
- Expo Notifications
- Expo Haptics
- Expo Clipboard
- Expo Updates
- Ionicons from `@expo/vector-icons`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

## Quality Checks

Run linting with:

```bash
npm run lint
```

Run TypeScript checking with:

```bash
npx tsc --noEmit
```

## Notes

The project uses Expo Router file-based routing, so screens are created by adding files inside the `app` directory. The tab navigation is configured in `app/(tabs)/_layout.tsx`.

Because this is a local-first tracker, meal history currently lives on the device through AsyncStorage. Uninstalling the app or clearing app data will remove stored meals unless cloud sync is added later.
