import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  PresentationChartLineIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const performanceStats = {
    evaluationsCompletes: 72,
    evaluationsEnCours: 12,
    objectifsAtteints: 85,
    indicateursPositifs: 68,
  };

  const quickAccessCards = [
    ...(isAdmin
      ? [
          {
            name: 'Objectifs',
            description: 'Définir et suivre les objectifs des employés',
            icon: TrophyIcon,
            href: '/dashboard/objectifs',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-200',
          },
          {
            name: 'Indicateurs',
            description: 'Configurer les indicateurs de performance',
            icon: PresentationChartLineIcon,
            href: '/dashboard/indicateurs',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200',
          },
        ]
      : []),
    {
      name: 'Évaluations',
      description: 'Effectuer les évaluations des employés',
      icon: ClipboardDocumentCheckIcon,
      href: '/dashboard/evaluations',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      name: 'Équipe',
      description: 'Voir la performance de votre équipe',
      icon: UserGroupIcon,
      href: '/dashboard/equipe',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord des performances
          </h1>
          <p className="mt-1 text-gray-600">
            Suivez et évaluez les performances de votre équipe en temps réel.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">
              {user?.username} • {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Évaluations complètes',
            value: `${performanceStats.evaluationsCompletes}%`,
            icon: ClipboardDocumentCheckIcon,
            color: 'green',
            progress: performanceStats.evaluationsCompletes,
          },
          {
            title: 'Évaluations en cours',
            value: performanceStats.evaluationsEnCours,
            icon: PresentationChartLineIcon,
            color: 'yellow',
          },
          {
            title: 'Objectifs atteints',
            value: `${performanceStats.objectifsAtteints}%`,
            icon: TrophyIcon,
            color: 'blue',
            progress: performanceStats.objectifsAtteints,
          },
          {
            title: 'Indicateurs positifs',
            value: `${performanceStats.indicateursPositifs}%`,
            icon: ChartBarIcon,
            color: 'purple',
            progress: performanceStats.indicateursPositifs,
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            {stat.progress && (
              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full bg-${stat.color}-500`}
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accès rapide */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessCards.map((card) => (
            <Link
              key={card.name}
              to={card.href}
              className={`group ${card.bgColor} p-6 rounded-xl border ${card.borderColor} shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${card.textColor} group-hover:opacity-80`}>
                    {card.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor} group-hover:bg-opacity-80`}>
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
              <div className={`mt-6 flex items-center text-sm font-medium ${card.textColor} group-hover:translate-x-1 transition-transform`}>
                Accéder
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
