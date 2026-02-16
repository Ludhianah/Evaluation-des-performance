import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  Cog6ToothIcon, 
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const stats = [
    {
      name: 'Objectifs',
      description: 'Gérez les objectifs de performance',
      icon: ChartBarIcon,
      href: '/dashboard/objectifs',
      color: 'bg-blue-500'
    },
    {
      name: 'Indicateurs',
      description: 'Configurez les indicateurs de mesure',
      icon: Cog6ToothIcon,
      href: '/dashboard/indicateurs',
      color: 'bg-green-500'
    },
    {
      name: 'Évaluations',
      description: 'Effectuez les évaluations des employés',
      icon: DocumentTextIcon,
      href: '/dashboard/evaluations',
      color: 'bg-purple-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre tableau de bord
          </h2>
          <p className="text-gray-600 mb-6">
            Gérez les performances de votre équipe grâce à notre système d'évaluation complet.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Informations Utilisateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom d'utilisateur:</span>
                <span className="ml-2 font-medium">{user?.username}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className="ml-2 font-medium text-green-600">Authentifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{stat.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                <span>Accéder</span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide d'utilisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Objectifs</h4>
              <p className="text-sm">Créez et gérez les objectifs de performance pour votre équipe. Définissez les cibles, les dates et les poids pour chaque objectif.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Indicateurs</h4>
              <p className="text-sm">Configurez les indicateurs de mesure associés à chaque objectif. Définissez les unités et les cibles spécifiques.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Évaluations</h4>
              <p className="text-sm">Effectuez les évaluations des employés en sélectionnant les indicateurs et en saisissant les réalisations. La note est calculée automatiquement.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Navigation</h4>
              <p className="text-sm">Utilisez la barre latérale pour naviguer entre les différentes sections du tableau de bord.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
