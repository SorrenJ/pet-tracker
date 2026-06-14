import React, { useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { Navbar } from './Navbar';
import { PetSelector } from './PetSelector';
import { useApp } from '../context/AppContext';
import { getPets } from '../api/pets';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const { dispatch } = useApp();

  useEffect(() => {
    getPets()
      .then(pets => dispatch({ type: 'SET_PETS', pets }))
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 pt-10 pb-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint size={24} />
            <span className="text-xl font-bold tracking-tight">PetTracker</span>
          </div>
          <PetSelector />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 pt-5 pb-24">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
