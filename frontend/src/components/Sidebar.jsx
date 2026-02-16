import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  Cog6ToothIcon, 
  UserGroupIcon,
  PlusCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
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

  return (
    <div className="fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 flex flex-col">
      <div className="flex items-center justify-center h-16 bg-gray-50 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
              item.current
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 ${
                item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Performance</p>
          <p>Management</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;