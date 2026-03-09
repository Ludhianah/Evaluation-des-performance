import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
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
            description: 'Suivre les objectifs des employés',
            icon: TrophyIcon,
            href: '/dashboard/objectifs',
            color: 'blue',
          },
          {
            name: 'Indicateurs',
            description: 'Configurer les indicateurs',
            icon: PresentationChartLineIcon,
            href: '/dashboard/indicateurs',
            color: 'purple',
          },
        ]
      : []),
    {
      name: 'Évaluations',
      description: 'Effectuer les évaluations',
      icon: ClipboardDocumentCheckIcon,
      href: '/dashboard/evaluations',
      color: 'green',
    },
    {
      name: 'Équipe',
      description: 'Voir la performance de votre équipe',
      icon: UserGroupIcon,
      href: '/dashboard/equipe',
      color: 'yellow',
    },
  ];

  const statCards = [
    { title: 'Évaluations complètes', value: `${performanceStats.evaluationsCompletes}%`, icon: ClipboardDocumentCheckIcon, color: 'green' },
    { title: 'Évaluations en cours', value: performanceStats.evaluationsEnCours, icon: DocumentTextIcon, color: 'yellow' },
    { title: 'Objectifs atteints', value: `${performanceStats.objectifsAtteints}%`, icon: TrophyIcon, color: 'blue' },
    { title: 'Indicateurs positifs', value: `${performanceStats.indicateursPositifs}%`, icon: ChartBarIcon, color: 'purple' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Suivez les performances de votre équipe en un coup d’œil.</p>
        </div>
        <div className="text-gray-700 font-medium">{user?.username} • {user?.role}</div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
          </div>
        ))}
      </div>

      {/* Accès rapide */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessCards.map((card) => (
            <Link
              key={card.name}
              to={card.href}
              className={`group bg-white p-4 rounded-xl border border-gray-100 shadow hover:shadow-md transition`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold text-gray-900`}>{card.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${card.color}-50`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 font-medium group-hover:underline">Accéder →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;