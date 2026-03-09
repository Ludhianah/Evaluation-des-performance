import {
  BuildingOffice2Icon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const hiddenRoutes = ['/', '/dashboard'];

  const allNavButtons = [
    { name: 'Services', icon: BuildingOffice2Icon, path: '/dashboard/services', roles: ['ADMIN'] },
    //{ name: 'Utilisateurs', icon: UsersIcon, path: '/dashboard/users', roles: ['ADMIN'] },
    { name: 'Employés', icon: UsersIcon, path: '/dashboard/employees', roles: ['ADMIN', 'RESPONSABLE'] },
    { name: 'Objectifs', icon: ChartBarIcon, path: '/dashboard/objectifs', roles: ['ADMIN', 'RESPONSABLE'] },
    { name: 'Indicateurs', icon: Cog6ToothIcon, path: '/dashboard/indicateurs', roles: ['ADMIN', 'RESPONSABLE'] },
    //{ name: 'Rapports', icon: DocumentChartBarIcon, path: '/dashboard/reports', roles: ['ADMIN'] },
  ];

  const navButtons = allNavButtons.filter(btn => btn.roles.includes(user?.role));

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto space-x-2 pb-1">
          {navButtons.map((btn) => {
            const isActive = location.pathname === btn.path;
            return (
              <button
                key={btn.name}
                onClick={() => navigate(btn.path)}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                <btn.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-xs font-medium mt-1">{btn.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
