import { formatDistanceToNow } from 'date-fns';
import { UtensilsCrossed, Activity, Heart, PawPrint, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp, useActivePetData } from '../context/AppContext';
import { EmptyPet } from '../components/EmptyPet';
import { Modal } from '../components/Modal';
import { PetForm } from '../components/PetForm';
import { recommendedDailyFood, recommendedDailyDistance, getAge, kmToMiles } from '../utils/calculations';

export function Dashboard() {
  const { activePet, state } = useApp();
  const { mealLogs, exerciseSessions, healthDocuments, mealBudget, getCurrentMonthExpenses } = useActivePetData();
  const [editPet, setEditPet] = useState(false);

  if (!activePet) return <EmptyPet />;

  const lastMeal = mealLogs[0];
  const rec = recommendedDailyFood(activePet);
  const recDist = recommendedDailyDistance(activePet.species);

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = exerciseSessions.filter(s => s.date.startsWith(today));
  const todaySteps = todaySessions.reduce((s, e) => s + e.steps, 0);
  const todayKm = todaySessions.reduce((s, e) => s + e.distanceKm, 0);
  const displayDist = state.distanceUnit === 'miles' ? kmToMiles(todayKm) : Math.round(todayKm * 100) / 100;

  const monthExpenses = getCurrentMonthExpenses();
  const budget = mealBudget?.monthlyBudget ?? 0;

  const cards = [
    {
      to: '/meals',
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      icon: UtensilsCrossed,
      title: 'Last Meal',
      value: lastMeal ? formatDistanceToNow(new Date(lastMeal.timestamp), { addSuffix: true }) : '—',
      sub: lastMeal ? `${lastMeal.amount} ${lastMeal.unit} of ${lastMeal.foodType}` : 'No meals logged yet',
    },
    {
      to: '/exercise',
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: Activity,
      title: 'Today\'s Activity',
      value: `${displayDist} ${state.distanceUnit}`,
      sub: `${todaySteps.toLocaleString()} steps · ${todaySessions.length} session${todaySessions.length === 1 ? '' : 's'}`,
    },
    {
      to: '/health',
      color: 'bg-rose-500',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      icon: Heart,
      title: 'Health Docs',
      value: `${healthDocuments.length}`,
      sub: `${healthDocuments.filter(d => d.category === 'vet_record').length} vet records · ${healthDocuments.filter(d => d.category === 'prescription').length} prescriptions`,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Pet profile card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
              {activePet.species === 'dog' ? '🐕' : activePet.species === 'cat' ? '🐱' : '🐾'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{activePet.name}</h2>
              <p className="text-sm text-gray-400">{activePet.breed || activePet.species}</p>
            </div>
          </div>
          <button
            onClick={() => setEditPet(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Edit2 size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">Weight</p>
            <p className="text-sm font-bold text-gray-700">{activePet.weight} {activePet.weightUnit}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">Age</p>
            <p className="text-sm font-bold text-gray-700">{activePet.birthDate ? getAge(activePet.birthDate) : '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-xs text-gray-400 mb-0.5">Daily Food</p>
            <p className="text-sm font-bold text-gray-700">{rec.min}–{rec.max}g</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 ${card.lightBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className={card.textColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{card.title}</p>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{card.value}</p>
                  <p className="text-xs text-gray-400 truncate">{card.sub}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <PawPrint size={14} className="text-indigo-400" />
          Daily Goals
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Food</span>
            <span className="font-semibold text-emerald-600">{rec.min}–{rec.max}g / day</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Walk distance</span>
            <span className="font-semibold text-blue-600">{recDist.min}–{recDist.max} {recDist.unit}</span>
          </div>
          {budget > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Monthly budget</span>
              <span className={`font-semibold ${monthExpenses > budget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {mealBudget?.currency}{monthExpenses.toFixed(2)} / {mealBudget?.currency}{budget}
              </span>
            </div>
          )}
        </div>
      </div>

      {editPet && (
        <Modal title="Edit Pet" onClose={() => setEditPet(false)}>
          <PetForm pet={activePet} onClose={() => setEditPet(false)} />
        </Modal>
      )}
    </div>
  );
}
