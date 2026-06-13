import { useState } from 'react';
import { PawPrint, Plus } from 'lucide-react';
import { Modal } from './Modal';
import { PetForm } from './PetForm';

export function EmptyPet() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <PawPrint size={36} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">No pet added yet</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">Add your first pet to start tracking meals, exercise, and health records.</p>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        <Plus size={18} />
        Add My Pet
      </button>
      {showForm && (
        <Modal title="Add Pet" onClose={() => setShowForm(false)}>
          <PetForm onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
