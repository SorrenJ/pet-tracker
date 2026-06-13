import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Plus, Trash2, Bell, DollarSign, ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';
import { useApp, useActivePetData } from '../context/AppContext';
import { EmptyPet } from '../components/EmptyPet';
import { Modal } from '../components/Modal';
import { recommendedDailyFood } from '../utils/calculations';
import type { AmountUnit, MealReminder } from '../types';

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

export function MealPlanner() {
  const { activePet, dispatch } = useApp();
  const { mealLogs, mealReminders, mealBudget, getCurrentMonthExpenses } = useActivePetData();
  const [modal, setModal] = useState<'log' | 'reminder' | 'budget' | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  if (!activePet) return <EmptyPet />;

  const rec = recommendedDailyFood(activePet);
  const lastMeal = mealLogs[0];
  const monthExpenses = getCurrentMonthExpenses();
  const budget = mealBudget?.monthlyBudget ?? 0;
  const budgetPct = budget > 0 ? Math.min((monthExpenses / budget) * 100, 100) : 0;

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
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setModal('log')}
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <Plus size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-600">Log Meal</p>
        </button>
        <button
          onClick={() => setModal('reminder')}
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <Bell size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-600">Reminder</p>
        </button>
        <button
          onClick={() => setModal('budget')}
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:border-emerald-200 transition-colors"
        >
          <DollarSign size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-600">Budget</p>
        </button>
      </div>

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
      {modal === 'reminder' && <Modal title="Add Reminder" onClose={() => setModal(null)}><ReminderModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'budget' && <Modal title="Meal Budget" onClose={() => setModal(null)}><BudgetModal onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}
