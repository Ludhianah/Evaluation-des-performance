import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminNavigation = [
    { name: 'Accueil', href: '/dashboard', icon: BuildingOffice2Icon },
    { name: 'Services', href: '/dashboard/services', icon: BuildingOffice2Icon },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Objectifs', href: '/dashboard/objectifs', icon: ChartBarIcon },
    { name: 'Indicateurs', href: '/dashboard/indicateurs', icon: Cog6ToothIcon },
    { name: 'Évaluations', href: '/dashboard/evaluations', icon: DocumentTextIcon },
    { name: 'Rapports', href: '/dashboard/reports', icon: DocumentChartBarIcon },
  ];

  const navigation = adminNavigation;

  return (
    <>
      {/* Bouton pour mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* En-tête de la sidebar */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-white/50">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-600' : 'text-green-600'}`}>
              {user?.role || 'Utilisateur'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname === item.href
                  ? 'bg-blue-100 text-blue-800 shadow-inner'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                  location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {location.pathname === item.href && (
                <div className="w-1 h-6 bg-blue-600 rounded-r-lg ml-2" />
              )}
            </Link>
          ))}
        </nav>

        {/* Pied de sidebar */}
        <div className="p-4 border-t border-gray-200 bg-white/50">
          <div className="text-xs text-gray-500 font-medium mb-2">Statut</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-600">{user?.username}</span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
