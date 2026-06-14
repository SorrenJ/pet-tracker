import { useState } from 'react';
import { LogOut, User, Mail, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import type { DistanceUnit } from '../types';

export function Account() {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(user?.distanceUnit ?? 'km');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const initials = (user?.name ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await updateUser({ name: name.trim() || undefined, distanceUnit });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Settings</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
            Changes saved
          </div>
        )}

        <div>
          <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <User size={14} className="text-gray-400" /> Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={e => { setName(e.target.value); setSuccess(false); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Mail size={14} className="text-gray-400" /> Email
          </label>
          <input
            type="email"
            disabled
            value={user?.email ?? ''}
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Ruler size={14} className="text-gray-400" /> Distance unit
          </label>
          <div className="flex gap-3">
            {(['km', 'miles'] as DistanceUnit[]).map(unit => (
              <button
                key={unit}
                type="button"
                onClick={() => { setDistanceUnit(unit); setSuccess(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  distanceUnit === unit
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
