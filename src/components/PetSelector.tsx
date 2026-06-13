import { useState } from 'react';
import { ChevronDown, Plus, PawPrint } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PetForm } from './PetForm';
import { Modal } from './Modal';

export function PetSelector() {
  const { state, dispatch, activePet } = useApp();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors"
        >
          <PawPrint size={16} />
          <span className="text-sm font-medium max-w-[120px] truncate">
            {activePet ? activePet.name : 'No pet'}
          </span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-40 min-w-[180px] py-1">
            {state.pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => { dispatch({ type: 'SET_ACTIVE_PET', petId: pet.id }); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${pet.id === activePet?.id ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}
              >
                <PawPrint size={14} />
                {pet.name}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { setShowForm(true); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
              >
                <Plus size={14} />
                Add pet
              </button>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <Modal title="Add Pet" onClose={() => setShowForm(false)}>
          <PetForm onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </>
  );
}
