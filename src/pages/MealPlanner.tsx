import { useState, useEffect } from 'react';
import { format, formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { Plus, Trash2, Bell, DollarSign, ChevronDown, ChevronUp, UtensilsCrossed, CalendarDays, Check, Pencil, Coffee, Sun, Moon, Cookie, X, ClipboardCheck, Repeat, Clock } from 'lucide-react';
import { useApp, useActivePetData } from '../context/AppContext';
import { EmptyPet } from '../components/EmptyPet';
import { Modal } from '../components/Modal';
import { recommendedDailyFood } from '../utils/calculations';
import type { AmountUnit, MealReminder, MealType, MealPlanItem, DailyMealPlan, MealSchedule, RecurrenceType } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CURRENCIES = ['$', '€', '£', '¥', 'A$', 'C$'];

function LogMealModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const [foodType, setFoodType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<AmountUnit>('grams');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    dispatch({
      type: 'ADD_MEAL_LOG',
      log: {
        petId: activePet.id,
        foodType,
        amount: parseFloat(amount),
        unit,
        timestamp: new Date(timestamp).toISOString(),
        cost: cost ? parseFloat(cost) : undefined,
        notes: notes || undefined,
      },
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Food Type *</label>
        <input
          required
          value={foodType}
          onChange={e => setFoodType(e.target.value)}
          placeholder="Dry kibble, wet food..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
        <div className="flex gap-2">
          <input
            required
            type="number"
            min="0.1"
            step="0.1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="100"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['grams', 'cups', 'oz'] as AmountUnit[]).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-2.5 py-2 text-xs font-medium transition-colors ${unit === u ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={e => setTimestamp(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cost (optional)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={cost}
          onChange={e => setCost(e.target.value)}
          placeholder="0.00"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any observations..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Log Meal</button>
      </div>
    </form>
  );
}

function ReminderModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    dispatch({
      type: 'ADD_MEAL_REMINDER',
      reminder: { petId: activePet.id, label: label || 'Feeding time!', time, days, enabled: true },
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Feeding time!"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${days.includes(i) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {d.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Add Reminder</button>
      </div>
    </form>
  );
}

function BudgetModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const { mealBudget } = useActivePetData();
  const [budget, setBudget] = useState(mealBudget?.monthlyBudget?.toString() ?? '');
  const [currency, setCurrency] = useState(mealBudget?.currency ?? '$');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    dispatch({ type: 'SET_MEAL_BUDGET', budget: { petId: activePet.id, monthlyBudget: parseFloat(budget), currency } });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget</label>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="100.00"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${currency === c ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-600'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Save Budget</button>
      </div>
    </form>
  );
}

const MEAL_TYPES: { value: MealType; label: string; icon: typeof Coffee }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Moon },
  { value: 'snack', label: 'Snack', icon: Cookie },
];

function getMealIcon(mealType: MealType) {
  return MEAL_TYPES.find(m => m.value === mealType)?.icon ?? Coffee;
}

function MealPlanModal({ onClose, existingPlan }: { onClose: () => void; existingPlan?: DailyMealPlan }) {
  const { dispatch, activePet } = useApp();
  const [date, setDate] = useState(() => existingPlan?.date ?? new Date().toISOString().slice(0, 10));
  const [meals, setMeals] = useState<MealPlanItem[]>(() => {
    if (existingPlan) return existingPlan.meals;
    return [
      { mealType: 'breakfast', foodType: '', amount: 0, unit: 'grams', completed: false },
      { mealType: 'lunch', foodType: '', amount: 0, unit: 'grams', completed: false },
      { mealType: 'dinner', foodType: '', amount: 0, unit: 'grams', completed: false },
    ];
  });

  function updateMeal(index: number, field: Partial<MealPlanItem>) {
    setMeals(prev => prev.map((m, i) => i === index ? { ...m, ...field } : m));
  }

  function addMeal() {
    setMeals(prev => [...prev, { mealType: 'snack', foodType: '', amount: 0, unit: 'grams' as AmountUnit, completed: false }]);
  }

  function removeMeal(index: number) {
    setMeals(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    const filledMeals = meals.filter(m => m.foodType.trim());
    if (filledMeals.length === 0) return;
    if (existingPlan) {
      dispatch({ type: 'UPDATE_DAILY_MEAL_PLAN', plan: { ...existingPlan, date, meals: filledMeals } });
    } else {
      dispatch({ type: 'SET_DAILY_MEAL_PLAN', plan: { petId: activePet.id, date, meals: filledMeals } });
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div className="space-y-3">
        {meals.map((meal, i) => {
          const Icon = getMealIcon(meal.mealType);
          return (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-emerald-500" />
                  <select
                    value={meal.mealType}
                    onChange={e => updateMeal(i, { mealType: e.target.value as MealType })}
                    className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
                  >
                    {MEAL_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                {meals.length > 1 && (
                  <button type="button" onClick={() => removeMeal(i)} className="p-1 hover:bg-gray-200 rounded-full">
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
              <input
                value={meal.foodType}
                onChange={e => updateMeal(i, { foodType: e.target.value })}
                placeholder="What food?"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={meal.amount || ''}
                  onChange={e => updateMeal(i, { amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Amount"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(['grams', 'cups', 'oz'] as AmountUnit[]).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => updateMeal(i, { unit: u })}
                      className={`px-2 py-1.5 text-xs font-medium transition-colors ${meal.unit === u ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={meal.notes ?? ''}
                onChange={e => updateMeal(i, { notes: e.target.value || undefined })}
                placeholder="Notes (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addMeal}
        className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
      >
        <Plus size={14} />
        Add another meal
      </button>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          {existingPlan ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; desc: string }[] = [
  { value: 'daily', label: 'Every day', desc: 'Repeats daily' },
  { value: 'every_other_day', label: 'Every other day', desc: 'Repeats every 2 days' },
  { value: 'weekdays', label: 'Weekdays', desc: 'Mon–Fri' },
  { value: 'weekends', label: 'Weekends', desc: 'Sat–Sun' },
  { value: 'custom', label: 'Custom days', desc: 'Pick specific days' },
];

function scheduleMatchesDate(schedule: MealSchedule, dateStr: string): boolean {
  if (!schedule.enabled) return false;
  if (dateStr < schedule.startDate) return false;
  if (schedule.endDate && dateStr > schedule.endDate) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.getDay();
  switch (schedule.recurrence) {
    case 'daily': return true;
    case 'every_other_day': {
      const diff = differenceInCalendarDays(d, new Date(schedule.startDate + 'T00:00:00'));
      return diff % 2 === 0;
    }
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekends': return dow === 0 || dow === 6;
    case 'custom': return schedule.customDays?.includes(dow) ?? false;
    default: return false;
  }
}

function ScheduleModal({ onClose, existingSchedule }: { onClose: () => void; existingSchedule?: MealSchedule }) {
  const { dispatch, activePet } = useApp();
  const [name, setName] = useState(existingSchedule?.name ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(existingSchedule?.recurrence ?? 'daily');
  const [customDays, setCustomDays] = useState<number[]>(existingSchedule?.customDays ?? [1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(existingSchedule?.startDate ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(existingSchedule?.endDate ?? '');
  const [meals, setMeals] = useState<MealPlanItem[]>(() => {
    if (existingSchedule) return existingSchedule.meals;
    return [
      { mealType: 'breakfast', foodType: '', amount: 0, unit: 'grams', completed: false },
      { mealType: 'lunch', foodType: '', amount: 0, unit: 'grams', completed: false },
      { mealType: 'dinner', foodType: '', amount: 0, unit: 'grams', completed: false },
    ];
  });

  function updateMeal(index: number, field: Partial<MealPlanItem>) {
    setMeals(prev => prev.map((m, i) => i === index ? { ...m, ...field } : m));
  }

  function addMeal() {
    setMeals(prev => [...prev, { mealType: 'snack', foodType: '', amount: 0, unit: 'grams' as AmountUnit, completed: false }]);
  }

  function removeMeal(index: number) {
    setMeals(prev => prev.filter((_, i) => i !== index));
  }

  function toggleDay(d: number) {
    setCustomDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    const filledMeals = meals.filter(m => m.foodType.trim());
    if (filledMeals.length === 0 || !name.trim()) return;
    const payload = {
      petId: activePet.id,
      name: name.trim(),
      recurrence,
      customDays: recurrence === 'custom' ? customDays : undefined,
      meals: filledMeals,
      startDate,
      endDate: endDate || undefined,
      enabled: existingSchedule?.enabled ?? true,
    };
    if (existingSchedule) {
      dispatch({ type: 'UPDATE_MEAL_SCHEDULE', schedule: { ...payload, id: existingSchedule.id } });
    } else {
      dispatch({ type: 'ADD_MEAL_SCHEDULE', schedule: payload });
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Routine Name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Daily meals, Medicine schedule..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
        <div className="grid grid-cols-2 gap-2">
          {RECURRENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRecurrence(opt.value)}
              className={`px-3 py-2 rounded-xl border text-left text-sm transition-colors ${recurrence === opt.value ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-200'}`}
            >
              <p className="font-medium">{opt.label}</p>
              <p className="text-xs text-gray-400">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {recurrence === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${customDays.includes(i) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {d.slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meals / Items</label>
        <div className="space-y-3">
          {meals.map((meal, i) => {
            const Icon = getMealIcon(meal.mealType);
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-emerald-500" />
                    <select
                      value={meal.mealType}
                      onChange={e => updateMeal(i, { mealType: e.target.value as MealType })}
                      className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
                    >
                      {MEAL_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {meals.length > 1 && (
                    <button type="button" onClick={() => removeMeal(i)} className="p-1 hover:bg-gray-200 rounded-full">
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <input
                  value={meal.foodType}
                  onChange={e => updateMeal(i, { foodType: e.target.value })}
                  placeholder="What food or medicine?"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={meal.amount || ''}
                    onChange={e => updateMeal(i, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Amount"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['grams', 'cups', 'oz'] as AmountUnit[]).map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => updateMeal(i, { unit: u })}
                        className={`px-2 py-1.5 text-xs font-medium transition-colors ${meal.unit === u ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  value={meal.notes ?? ''}
                  onChange={e => updateMeal(i, { notes: e.target.value || undefined })}
                  placeholder="Notes (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addMeal}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
        >
          <Plus size={14} />
          Add another item
        </button>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          {existingSchedule ? 'Update Routine' : 'Create Routine'}
        </button>
      </div>
    </form>
  );
}

export function MealPlanner() {
  const { activePet, dispatch } = useApp();
  const { mealLogs, mealReminders, mealBudget, dailyMealPlans, mealSchedules, getCurrentMonthExpenses } = useActivePetData();
  const [modal, setModal] = useState<'log' | 'reminder' | 'budget' | 'plan' | 'schedule' | null>(null);
  const [editingPlan, setEditingPlan] = useState<DailyMealPlan | undefined>(undefined);
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | undefined>(undefined);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Auto-generate today's plan from active schedules
  useEffect(() => {
    if (!activePet) return;
    const hasTodayPlan = dailyMealPlans.some(p => p.date === today);
    if (hasTodayPlan) return;
    const matchingSchedule = mealSchedules.find(s => scheduleMatchesDate(s, today));
    if (matchingSchedule) {
      dispatch({
        type: 'SET_DAILY_MEAL_PLAN',
        plan: {
          petId: activePet.id,
          date: today,
          meals: matchingSchedule.meals.map(m => ({ ...m, completed: false })),
        },
      });
    }
  }, [activePet, today, dailyMealPlans.length, mealSchedules]);

  if (!activePet) return <EmptyPet />;

  const rec = recommendedDailyFood(activePet);
  const lastMeal = mealLogs[0];
  const monthExpenses = getCurrentMonthExpenses();
  const budget = mealBudget?.monthlyBudget ?? 0;
  const budgetPct = budget > 0 ? Math.min((monthExpenses / budget) * 100, 100) : 0;

  const todayPlan = dailyMealPlans.find(p => p.date === today);
  const upcomingPlans = dailyMealPlans
    .filter(p => p.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const completedCount = todayPlan ? todayPlan.meals.filter(m => m.completed).length : 0;
  const totalMeals = todayPlan ? todayPlan.meals.length : 0;

  function toggleMealCompleted(plan: DailyMealPlan, mealIndex: number) {
    const updatedMeals = plan.meals.map((m, i) =>
      i === mealIndex ? { ...m, completed: !m.completed } : m
    );
    dispatch({ type: 'UPDATE_DAILY_MEAL_PLAN', plan: { ...plan, meals: updatedMeals } });
  }

  function completePlan(plan: DailyMealPlan) {
    const completedMeals = plan.meals.filter(m => m.completed);
    for (const meal of completedMeals) {
      dispatch({
        type: 'ADD_MEAL_LOG',
        log: {
          petId: plan.petId,
          foodType: meal.foodType,
          amount: meal.amount,
          unit: meal.unit,
          timestamp: new Date().toISOString(),
          notes: meal.notes,
        },
      });
    }
    dispatch({ type: 'DELETE_DAILY_MEAL_PLAN', id: plan.id });
  }

  const visibleLogs = showAllLogs ? mealLogs : mealLogs.slice(0, 5);

  function toggleReminder(r: MealReminder) {
    dispatch({ type: 'UPDATE_MEAL_REMINDER', reminder: { ...r, enabled: !r.enabled } });
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="bg-emerald-500 text-white rounded-2xl p-5">
        <p className="text-emerald-100 text-sm mb-1">Last fed</p>
        <p className="text-2xl font-bold mb-0.5">
          {lastMeal ? formatDistanceToNow(new Date(lastMeal.timestamp), { addSuffix: true }) : 'Not yet today'}
        </p>
        {lastMeal && (
          <p className="text-emerald-100 text-sm">{lastMeal.amount} {lastMeal.unit} · {lastMeal.foodType}</p>
        )}
        <div className="mt-4 bg-emerald-600/50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs">Recommended daily</p>
            <p className="text-white font-semibold">{rec.min}–{rec.max}g</p>
          </div>
          <UtensilsCrossed size={20} className="text-emerald-200" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-5 gap-1.5">
        <button
          onClick={() => setModal('log')}
          className="bg-white border border-gray-100 rounded-2xl p-2.5 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <Plus size={16} className="text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[10px] font-medium text-gray-600">Log Meal</p>
        </button>
        <button
          onClick={() => { setEditingPlan(undefined); setModal('plan'); }}
          className="bg-white border border-gray-100 rounded-2xl p-2.5 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <CalendarDays size={16} className="text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[10px] font-medium text-gray-600">Meal Plan</p>
        </button>
        <button
          onClick={() => { setEditingSchedule(undefined); setModal('schedule'); }}
          className="bg-white border border-gray-100 rounded-2xl p-2.5 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <Repeat size={16} className="text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[10px] font-medium text-gray-600">Routine</p>
        </button>
        <button
          onClick={() => setModal('reminder')}
          className="bg-white border border-gray-100 rounded-2xl p-2.5 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <Bell size={16} className="text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[10px] font-medium text-gray-600">Reminder</p>
        </button>
        <button
          onClick={() => setModal('budget')}
          className="bg-white border border-gray-100 rounded-2xl p-2.5 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <DollarSign size={16} className="text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[10px] font-medium text-gray-600">Budget</p>
        </button>
      </div>

      {/* Today's Meal Plan */}
      {todayPlan ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-700">Today's Meal Plan</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{completedCount}/{totalMeals} done</span>
              <button
                onClick={() => { setEditingPlan(todayPlan); setModal('plan'); }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <Pencil size={14} className="text-gray-400" />
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_DAILY_MEAL_PLAN', id: todayPlan.id })}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <Trash2 size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          {totalMeals > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${completedCount === totalMeals ? 'bg-emerald-400' : 'bg-emerald-300'}`}
                style={{ width: `${(completedCount / totalMeals) * 100}%` }}
              />
            </div>
          )}
          <div className="space-y-1.5">
            {todayPlan.meals.map((meal, i) => {
              const Icon = getMealIcon(meal.mealType);
              return (
                <div
                  key={i}
                  onClick={() => toggleMealCompleted(todayPlan, i)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${meal.completed ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${meal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                    {meal.completed && <Check size={14} className="text-white" />}
                  </div>
                  <Icon size={16} className={meal.completed ? 'text-emerald-400' : 'text-gray-400'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${meal.completed ? 'text-emerald-600 line-through' : 'text-gray-700'}`}>
                      {meal.foodType}
                    </p>
                    <p className="text-xs text-gray-400">
                      {MEAL_TYPES.find(t => t.value === meal.mealType)?.label} · {meal.amount} {meal.unit}
                      {meal.notes && ` · ${meal.notes}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {completedCount > 0 && (
            <button
              onClick={() => completePlan(todayPlan)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <ClipboardCheck size={16} />
              Complete Plan · Log {completedCount} {completedCount === 1 ? 'meal' : 'meals'}
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => { setEditingPlan(undefined); setModal('plan'); }}
          className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-gray-200 text-center cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <CalendarDays size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No meal plan for today</p>
          <p className="text-xs text-gray-400">Tap to create one</p>
        </div>
      )}

      {/* Budget tracker */}
      {mealBudget && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Monthly Budget</h3>
            <button onClick={() => setModal('budget')} className="text-xs text-emerald-600 font-medium">Edit</button>
          </div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-2xl font-bold text-gray-800">{mealBudget.currency}{monthExpenses.toFixed(2)}</span>
            <span className="text-sm text-gray-400 mb-0.5">/ {mealBudget.currency}{budget}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPct >= 100 ? 'bg-rose-400' : budgetPct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {budget > monthExpenses ? `${mealBudget.currency}${(budget - monthExpenses).toFixed(2)} remaining this month` : 'Budget exceeded!'}
          </p>
        </div>
      )}

      {/* Active Routines */}
      {mealSchedules.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Repeat size={16} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-700">Routines</h3>
            </div>
            <button
              onClick={() => { setEditingSchedule(undefined); setModal('schedule'); }}
              className="text-xs text-emerald-600 font-medium"
            >
              + New
            </button>
          </div>
          <div className="space-y-2">
            {mealSchedules.map(s => {
              const recLabel = RECURRENCE_OPTIONS.find(r => r.value === s.recurrence)?.label ?? s.recurrence;
              const matchesToday = scheduleMatchesDate(s, today);
              return (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_MEAL_SCHEDULE', schedule: { ...s, enabled: !s.enabled } })}
                      className={`w-10 h-6 rounded-full transition-colors ${s.enabled ? 'bg-emerald-400' : 'bg-gray-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow mx-auto transition-transform ${s.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-700">{s.name}</p>
                        {matchesToday && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Today</span>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {recLabel} · {s.meals.length} {s.meals.length === 1 ? 'item' : 'items'}
                        {s.endDate && ` · Until ${format(new Date(s.endDate), 'MMM d')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingSchedule(s); setModal('schedule'); }}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <Pencil size={14} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_MEAL_SCHEDULE', id: s.id })}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <Trash2 size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Plans */}
      {upcomingPlans.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-gray-700">Upcoming Plans</h3>
          </div>
          <div className="space-y-2">
            {upcomingPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{format(new Date(plan.date), 'EEEE, MMM d')}</p>
                  <p className="text-xs text-gray-400">
                    {plan.meals.map(m => m.foodType).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingPlan(plan); setModal('plan'); }}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_DAILY_MEAL_PLAN', id: plan.id })}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <Trash2 size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders */}
      {mealReminders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Feeding Reminders</h3>
          <div className="space-y-2">
            {mealReminders.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReminder(r)}
                    className={`w-10 h-6 rounded-full transition-colors ${r.enabled ? 'bg-emerald-400' : 'bg-gray-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mx-auto transition-transform ${r.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.label}</p>
                    <p className="text-xs text-gray-400">{r.time} · {r.days.map(d => DAYS[d].slice(0,1)).join(' ')}</p>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: 'DELETE_MEAL_REMINDER', id: r.id })} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal history */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3">Meal History</h3>
        {mealLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No meals logged yet</p>
        ) : (
          <div className="space-y-2">
            {visibleLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{log.foodType}</p>
                    {log.cost != null && (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                        {mealBudget?.currency ?? '$'}{log.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{log.amount} {log.unit} · {format(new Date(log.timestamp), 'MMM d, h:mm a')}</p>
                  {log.notes && <p className="text-xs text-gray-400 italic">{log.notes}</p>}
                </div>
                <button onClick={() => dispatch({ type: 'DELETE_MEAL_LOG', id: log.id })} className="ml-2 p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
            {mealLogs.length > 5 && (
              <button
                onClick={() => setShowAllLogs(s => !s)}
                className="w-full flex items-center justify-center gap-1 pt-2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showAllLogs ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {mealLogs.length} meals</>}
              </button>
            )}
          </div>
        )}
      </div>

      {modal === 'log' && <Modal title="Log a Meal" onClose={() => setModal(null)}><LogMealModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'plan' && <Modal title={editingPlan ? 'Edit Meal Plan' : 'Create Meal Plan'} onClose={() => setModal(null)} size="lg"><MealPlanModal onClose={() => setModal(null)} existingPlan={editingPlan} /></Modal>}
      {modal === 'schedule' && <Modal title={editingSchedule ? 'Edit Routine' : 'Create Routine'} onClose={() => setModal(null)} size="lg"><ScheduleModal onClose={() => setModal(null)} existingSchedule={editingSchedule} /></Modal>}
      {modal === 'reminder' && <Modal title="Add Reminder" onClose={() => setModal(null)}><ReminderModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'budget' && <Modal title="Meal Budget" onClose={() => setModal(null)}><BudgetModal onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}
