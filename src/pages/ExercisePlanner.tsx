import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Play, Square, Plus, Trash2, Bell, ArrowLeftRight, Activity, Footprints } from 'lucide-react';
import { useApp, useActivePetData } from '../context/AppContext';
import { EmptyPet } from '../components/EmptyPet';
import { Modal } from '../components/Modal';
import {
  recommendedDailyDistance,
  recommendedDailySteps,
  stepsToKm,
  kmToMiles,
} from '../utils/calculations';
import type { ExerciseReminder } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function LogSessionModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const [steps, setSteps] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    const s = parseInt(steps);
    const km = stepsToKm(s, activePet.species);
    dispatch({
      type: 'ADD_EXERCISE_SESSION',
      session: {
        petId: activePet.id,
        date: new Date(date).toISOString(),
        steps: s,
        distanceKm: km,
        durationMinutes: parseInt(duration),
        notes: notes || undefined,
      },
    });
    onClose();
  }

  const s = parseInt(steps) || 0;
  const km = activePet ? stepsToKm(s, activePet.species) : 0;
  const miles = kmToMiles(km);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Steps *</label>
        <input
          required
          type="number"
          min="1"
          value={steps}
          onChange={e => setSteps(e.target.value)}
          placeholder="1500"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {s > 0 && (
          <p className="text-xs text-gray-400 mt-1">≈ {km} km · {miles} miles</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
        <input
          required
          type="number"
          min="1"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="30"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Park walk, trail run..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Log Session</button>
      </div>
    </form>
  );
}

function ReminderModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('07:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    dispatch({ type: 'ADD_EXERCISE_REMINDER', reminder: { petId: activePet.id, label: label || 'Walk time!', time, days, enabled: true } });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Walk time!" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button key={d} type="button" onClick={() => toggleDay(i)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${days.includes(i) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{d.slice(0, 1)}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Add Reminder</button>
      </div>
    </form>
  );
}

function ConverterModal({ onClose }: { onClose: () => void }) {
  const { activePet } = useApp();
  const [steps, setSteps] = useState('1000');
  const s = parseInt(steps) || 0;
  const km = activePet ? stepsToKm(s, activePet.species) : 0;
  const miles = kmToMiles(km);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
        <input
          type="number"
          min="0"
          value={steps}
          onChange={e => setSteps(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-400 mb-1">Kilometers</p>
          <p className="text-2xl font-bold text-blue-700">{km}</p>
          <p className="text-xs text-blue-400">km</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-400 mb-1">Miles</p>
          <p className="text-2xl font-bold text-blue-700">{miles}</p>
          <p className="text-xs text-blue-400">mi</p>
        </div>
      </div>
      {activePet && (
        <p className="text-xs text-gray-400 text-center">Based on average {activePet.species} stride length</p>
      )}
      <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Close</button>
    </div>
  );
}

export function ExercisePlanner() {
  const { activePet, dispatch, state } = useApp();
  const { exerciseSessions, exerciseReminders } = useActivePetData();
  const [modal, setModal] = useState<'log' | 'reminder' | 'convert' | null>(null);

  const [tracking, setTracking] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tracking) {
      timerRef.current = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tracking]);

  function handleStopTracking() {
    if (!activePet || sessionSteps === 0) { setTracking(false); setSessionSteps(0); setSessionSeconds(0); return; }
    const km = stepsToKm(sessionSteps, activePet.species);
    dispatch({
      type: 'ADD_EXERCISE_SESSION',
      session: {
        petId: activePet.id,
        date: new Date().toISOString(),
        steps: sessionSteps,
        distanceKm: km,
        durationMinutes: Math.round(sessionSeconds / 60),
      },
    });
    setTracking(false);
    setSessionSteps(0);
    setSessionSeconds(0);
  }

  function toggleReminder(r: ExerciseReminder) {
    dispatch({ type: 'UPDATE_EXERCISE_REMINDER', reminder: { ...r, enabled: !r.enabled } });
  }

  if (!activePet) return <EmptyPet />;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = exerciseSessions.filter(s => s.date.startsWith(today));
  const todaySteps = todaySessions.reduce((s, e) => s + e.steps, 0);
  const todayKm = todaySessions.reduce((s, e) => s + e.distanceKm, 0);

  const recSteps = recommendedDailySteps(activePet.species);
  const recDist = recommendedDailyDistance(activePet.species);
  const stepsProgress = Math.min((todaySteps / recSteps.max) * 100, 100);

  const displayKm = state.distanceUnit === 'miles' ? kmToMiles(todayKm) : Math.round(todayKm * 100) / 100;
  const distLabel = state.distanceUnit === 'miles' ? 'miles' : 'km';

  const sessionKm = activePet ? stepsToKm(sessionSteps, activePet.species) : 0;
  const sessionMin = Math.floor(sessionSeconds / 60);
  const sessionSec = sessionSeconds % 60;

  return (
    <div className="space-y-4">
      {/* Today's stats */}
      <div className="bg-blue-500 text-white rounded-2xl p-5">
        <p className="text-blue-100 text-sm mb-1">Today's activity</p>
        <div className="flex items-end gap-3 mb-3">
          <div>
            <span className="text-3xl font-bold">{todaySteps.toLocaleString()}</span>
            <span className="text-blue-200 text-sm ml-1">steps</span>
          </div>
          <div className="text-blue-200 text-sm mb-1">·</div>
          <div>
            <span className="text-xl font-semibold">{displayKm}</span>
            <span className="text-blue-200 text-sm ml-1">{distLabel}</span>
          </div>
        </div>
        <div className="h-2.5 bg-blue-600/50 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${stepsProgress}%` }} />
        </div>
        <p className="text-blue-100 text-xs">Goal: {recSteps.min.toLocaleString()}–{recSteps.max.toLocaleString()} steps · {recDist.min}–{recDist.max} km</p>
      </div>

      {/* Pedometer / Live Tracker */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Footprints size={18} className="text-blue-400" />
          Live Walk Tracker
        </h3>
        {tracking ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xl font-bold text-blue-700">{sessionSteps.toLocaleString()}</p>
                <p className="text-xs text-blue-400">steps</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xl font-bold text-blue-700">{sessionKm}</p>
                <p className="text-xs text-blue-400">km</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xl font-bold text-blue-700">{sessionMin}:{sessionSec.toString().padStart(2, '0')}</p>
                <p className="text-xs text-blue-400">time</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionSteps(s => s + 100)}
                className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                +100 steps
              </button>
              <button
                onClick={handleStopTracking}
                className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-rose-600"
              >
                <Square size={14} fill="white" />
                Stop & Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setTracking(true)}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600"
            >
              <Play size={16} fill="white" />
              Start Walk
            </button>
            <button
              onClick={() => setModal('convert')}
              className="py-3 px-4 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-200"
            >
              <ArrowLeftRight size={16} />
              Convert
            </button>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('log')} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:border-blue-200 transition-colors">
          <Plus size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-600">Log Session</p>
        </button>
        <button onClick={() => setModal('reminder')} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:border-blue-200 transition-colors">
          <Bell size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-600">Set Reminder</p>
        </button>
      </div>

      {/* Unit toggle */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">Distance unit</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['km', 'miles'] as const).map(u => (
            <button
              key={u}
              onClick={() => dispatch({ type: 'SET_DISTANCE_UNIT', unit: u })}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${state.distanceUnit === u ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders */}
      {exerciseReminders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Walk Reminders</h3>
          <div className="space-y-2">
            {exerciseReminders.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReminder(r)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${r.enabled ? 'bg-blue-400' : 'bg-gray-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${r.enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.label}</p>
                    <p className="text-xs text-gray-400">{r.time} · {r.days.map(d => DAYS[d].slice(0, 1)).join(' ')}</p>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: 'DELETE_EXERCISE_REMINDER', id: r.id })} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3">Session History</h3>
        {exerciseSessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No sessions logged yet</p>
        ) : (
          <div className="space-y-2">
            {exerciseSessions.slice(0, 7).map(s => {
              const dist = state.distanceUnit === 'miles' ? kmToMiles(s.distanceKm) : Math.round(s.distanceKm * 100) / 100;
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{s.steps.toLocaleString()} steps · {dist} {distLabel}</p>
                      <p className="text-xs text-gray-400">{s.durationMinutes} min · {format(new Date(s.date), 'MMM d')}</p>
                      {s.notes && <p className="text-xs text-gray-400 italic">{s.notes}</p>}
                    </div>
                  </div>
                  <button onClick={() => dispatch({ type: 'DELETE_EXERCISE_SESSION', id: s.id })} className="p-1.5 hover:bg-gray-100 rounded-full ml-2">
                    <Trash2 size={14} className="text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'log' && <Modal title="Log Walk Session" onClose={() => setModal(null)}><LogSessionModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'reminder' && <Modal title="Walk Reminder" onClose={() => setModal(null)}><ReminderModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'convert' && <Modal title="Steps Converter" onClose={() => setModal(null)} size="sm"><ConverterModal onClose={() => setModal(null)} /></Modal>}
    </div>
  );
}
