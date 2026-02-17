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
  const isAdmin = user?.role === 'ADMIN';
  const isResponsable = user?.role === 'RESPONSABLE';

  const stats = [
    ...(isAdmin ? [{
      name: 'Objectifs',
      description: 'Gérez les objectifs de performance',
      icon: ChartBarIcon,
      href: '/dashboard/objectifs',
      color: 'bg-blue-600',
      hover: 'hover:bg-blue-50'
    }] : []),
    ...(isAdmin ? [{
      name: 'Indicateurs',
      description: 'Configurez les indicateurs de mesure',
      icon: Cog6ToothIcon,
      href: '/dashboard/indicateurs',
      color: 'bg-emerald-600',
      hover: 'hover:bg-emerald-50'
    }] : []),
    {
      name: 'Évaluations',
      description: 'Effectuez les évaluations des employés',
      icon: DocumentTextIcon,
      href: '/dashboard/evaluations',
      color: 'bg-purple-600',
      hover: 'hover:bg-purple-50'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm/30 p-6 border border-gray-100/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                Bon retour, <span className="text-blue-600 font-bold">{user?.username}</span>
              </h2>
              <p className="text-gray-500 max-w-md">
                Optimisez la performance de votre équipe avec notre outil d’évaluation intelligent.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50/60 rounded-xl p-4 border border-gray-100/60">
            <h3 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wider">Informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center py-1.5 px-2 bg-white rounded-lg shadow-xs border border-gray-100/30">
                <span className="text-gray-500">Utilisateur</span>
                <span className="ml-2 font-medium text-gray-900">{user?.username}</span>
              </div>
              <div className="flex items-center py-1.5 px-2 bg-white rounded-lg shadow-xs border border-gray-100/30">
                <span className="text-gray-500">Statut</span>
                <span className="ml-2 font-medium text-green-600 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className={`bg-white rounded-2xl p-5 border border-gray-100/60 shadow-sm/30 ${stat.hover} transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-200">
                    {stat.name}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} shadow-sm/50 group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                <span>Accéder</span>
                <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Role-specific instructions */}
        <div className="bg-white rounded-2xl shadow-sm/30 p-6 border border-gray-100/60">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-1 border-b border-gray-100/30">Accès selon votre rôle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100/30 transition-all duration-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                Administrateur
                {isAdmin && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Actif</span>}
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Accès complet à la gestion des Objectifs</li>
                <li>• Accès complet à la gestion des Indicateurs</li>
                <li>• Accès à la gestion des Évaluations</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-green-50/60 hover:bg-green-100/60 border border-green-100/30 transition-all duration-200">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Responsable
                {isResponsable && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Actif</span>}
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Accès limité aux Objectifs (lecture seule)</li>
                <li>• Accès limité aux Indicateurs (lecture seule)</li>
                <li>• Accès complet à la gestion des Évaluations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* General instructions */}
        <div className="bg-white rounded-2xl shadow-sm/30 p-6 border border-gray-100/60">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-1 border-b border-gray-100/30">Guide d'utilisation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Objectifs", desc: "Créez et gérez les objectifs de performance pour votre équipe. Définissez les cibles, les dates et les poids pour chaque objectif." },
              { title: "Indicateurs", desc: "Configurez les indicateurs de mesure associés à chaque objectif. Définissez les unités et les cibles spécifiques." },
              { title: "Évaluations", desc: "Effectuez les évaluations des employés en sélectionnant les indicateurs et en saisissant les réalisations. La note est calculée automatiquement." },
              { title: "Navigation", desc: "Utilisez la barre latérale pour naviguer entre les différentes sections du tableau de bord." }
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-50/60 hover:bg-gray-100/60 border border-gray-100/30 transition-all duration-200 hover:shadow-sm/30"
              >
                <h4 className="font-medium text-gray-900 mb-1.5">{item.title}</h4>
                <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
