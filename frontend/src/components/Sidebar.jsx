import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const adminNavigation = [
    { name: 'Accueil', href: '/dashboard', icon: BuildingOffice2Icon },
    { name: 'Évaluations', href: '/dashboard/evaluations', icon: DocumentTextIcon },
  ];

  const userNavigation = [
    { name: 'Accueil', href: '/dashboard', icon: BuildingOffice2Icon },
    { name: 'Évaluations', href: '/dashboard/evaluations', icon: DocumentTextIcon },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Bouton mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow border border-gray-200"
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Performance</h1>

            <p
              className={`text-xs mt-1 font-medium ${
                isAdmin ? 'text-blue-600' : 'text-green-600'
              }`}
            >
              {user?.role === "ADMIN"
                ? "Administrateur"
                : `Responsable du service ${user?.service?.nom || ""}`}
            </p>

          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />

                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">

              <UserCircleIcon className="h-6 w-6 text-gray-400" />

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {user?.username}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.role === "ADMIN"
                    ? "Administrateur connecté"
                    : `Responsable - ${user?.service?.nom || ""}`}
                </p>
              </div>

            </div>

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {user?.role === "ADMIN"
                ? "Admin"
                : `Resp. ${user?.service?.nom || ""}`}
            </span>

          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Déconnexion
          </button>

        </div>

      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;