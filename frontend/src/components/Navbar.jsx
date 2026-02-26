import {
  BuildingOffice2Icon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const allNavButtons = [
    { name: 'Services', icon: BuildingOffice2Icon, path: '/dashboard/services', roles: ['ADMIN'] },
    { name: 'Utilisateurs', icon: UsersIcon, path: '/dashboard/users', roles: ['ADMIN'] },
    { name: 'Objectifs', icon: ChartBarIcon, path: '/dashboard/objectifs', roles: ['ADMIN', 'RESPONSABLE'] },
    { name: 'Indicateurs', icon: Cog6ToothIcon, path: '/dashboard/indicateurs', roles: ['ADMIN', 'RESPONSABLE'] },
    { name: 'Rapports', icon: DocumentChartBarIcon, path: '/dashboard/reports', roles: ['ADMIN'] },
    
  ];

  const navButtons = allNavButtons.filter(btn =>
    btn.roles.includes(user?.role)
  );

  return (
    <div className="bg-white shadow px-6 py-3 flex space-x-4">
      {navButtons.map(btn => (
        <button
          key={btn.name}
          onClick={() => navigate(btn.path)}
          className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm font-medium"
        >
          <btn.icon className="h-4 w-4 mr-1" />
          {btn.name}
        </button>
      ))}
    </div>
  );
};

export default Navbar;