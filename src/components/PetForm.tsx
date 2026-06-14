import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createPet, updatePet } from '../api/pets';
import type { Pet, Species, WeightUnit } from '../types';

interface Props {
  onClose: () => void;
  pet?: Pet;
}

export function PetForm({ onClose, pet }: Props) {
  const { dispatch } = useApp();
  const [name, setName] = useState(pet?.name ?? '');
  const [species, setSpecies] = useState<Species>(pet?.species ?? 'dog');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [weight, setWeight] = useState(pet?.weight?.toString() ?? '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(pet?.weightUnit ?? 'kg');
  const [birthDate, setBirthDate] = useState(pet?.birthDate ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = { name, species, breed, weight: parseFloat(weight), weightUnit, birthDate };
    try {
      if (pet) {
        const updated = await updatePet(pet.id, data);
        dispatch({ type: 'UPDATE_PET', pet: updated });
      } else {
        const created = await createPet(data);
        dispatch({ type: 'ADD_PET', pet: created });
      }
      onClose();
    } catch {
      setError('Failed to save pet. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Buddy"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
        <div className="grid grid-cols-3 gap-2">
          {(['dog', 'cat', 'other'] as Species[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecies(s)}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${species === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              {s === 'dog' ? '🐕' : s === 'cat' ? '🐱' : '🐾'} {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
        <input
          value={breed}
          onChange={e => setBreed(e.target.value)}
          placeholder="Golden Retriever"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weight *</label>
        <div className="flex gap-2">
          <input
            required
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="10"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['kg', 'lbs'] as WeightUnit[]).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${weightUnit === u ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
        <input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
          {loading ? 'Saving…' : pet ? 'Save Changes' : 'Add Pet'}
        </button>
      </div>
    </form>
  );
}
