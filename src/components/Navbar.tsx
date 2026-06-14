import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Activity, Heart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/exercise', icon: Activity, label: 'Exercise' },
  { to: '/health', icon: Heart, label: 'Health' },
];

export function Navbar() {
  const { user } = useAuth();

  const initials = (user?.name ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom">
      <div className="flex justify-around max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-3 px-4 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold leading-none transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {initials}
              </div>
              <span>{user?.name?.split(' ')[0] ?? 'Account'}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
