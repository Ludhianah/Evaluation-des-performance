import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  Cog6ToothIcon, 
  UserGroupIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ChartPieIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isResponsable = user?.role === 'RESPONSABLE';

  const adminNavigation = [
    {
      name: 'Services',
      href: '/dashboard/services',
      icon: BuildingOffice2Icon,
      current: location.pathname === '/dashboard/services'
    },
    {
      name: 'Utilisateurs',
      href: '/dashboard/users',
      icon: UsersIcon,
      current: location.pathname === '/dashboard/users'
    },
    {
      name: 'Objectifs',
      href: '/dashboard/objectifs',
      icon: ChartBarIcon,
      current: location.pathname === '/dashboard/objectifs'
    },
    {
      name: 'Indicateurs',
      href: '/dashboard/indicateurs',
      icon: Cog6ToothIcon,
      current: location.pathname === '/dashboard/indicateurs'
    },
    {
      name: 'Évaluations',
      href: '/dashboard/evaluations',
      icon: DocumentTextIcon,
      current: location.pathname === '/dashboard/evaluations'
    },
    {
      name: 'Rapports',
      href: '/dashboard/reports',
      icon: DocumentChartBarIcon,
      current: location.pathname === '/dashboard/reports'
    }
  ];

  const responsableNavigation = [
    {
      name: 'Objectifs',
      href: '/dashboard/objectifs',
      icon: ChartBarIcon,
      current: location.pathname === '/dashboard/objectifs'
    },
    {
      name: 'Indicateurs',
      href: '/dashboard/indicateurs',
      icon: Cog6ToothIcon,
      current: location.pathname === '/dashboard/indicateurs'
    },
    {
      name: 'Évaluations',
      href: '/dashboard/evaluations',
      icon: DocumentTextIcon,
      current: location.pathname === '/dashboard/evaluations'
    }
  ];

  const navigation = isAdmin ? adminNavigation : responsableNavigation;

  return (
    <div className="fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 flex flex-col">
      <div className="flex items-center justify-center h-16 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className={`text-xs mt-1 ${
            isAdmin ? 'text-blue-600' : 'text-green-600'
          }`}>
            {user?.role || 'Utilisateur'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {isAdmin ? 'Administration' : 'Responsable'}
          </h3>
        </div>
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
              item.current
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            <span className="flex-1">{item.name}</span>
            <svg
              className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                item.current ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="text-xs text-gray-500 font-medium mb-2">Statut</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-600">{user?.username}</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;