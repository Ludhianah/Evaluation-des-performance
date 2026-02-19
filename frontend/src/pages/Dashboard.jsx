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

  // Données fictives pour les indicateurs de performance
  const performanceStats = {
    evaluationsCompletes: 72,
    evaluationsEnCours: 12,
    objectifsAtteints: 85,
    indicateursPositifs: 68,
  };

  // Cartes d'accès rapide
  const quickAccessCards = [
    ...(isAdmin
      ? [
          {
            name: 'Objectifs',
            description: 'Définir et suivre les objectifs des employés',
            icon: TrophyIcon,
            href: '/dashboard/objectifs',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200',
          },
          {
            name: 'Indicateurs',
            description: 'Configurer les indicateurs de performance',
            icon: PresentationChartLineIcon,
            href: '/dashboard/indicateurs',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
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
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    {
      name: 'Équipe',
      description: 'Voir la performance de votre équipe',
      icon: UserGroupIcon,
      href: '/dashboard/equipe',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* En-tête du Dashboard */}
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
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">
              {user?.username} • {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques de Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Évaluations complètes</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{performanceStats.evaluationsCompletes}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${performanceStats.evaluationsCompletes}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Évaluations en cours</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{performanceStats.evaluationsEnCours}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <PresentationChartLineIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Objectifs atteints</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{performanceStats.objectifsAtteints}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${performanceStats.objectifsAtteints}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Indicateurs positifs</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{performanceStats.indicateursPositifs}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-purple-500 rounded-full"
              style={{ width: `${performanceStats.indicateursPositifs}%` }}
            ></div>
          </div>
        </div>
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

      {/* Section Évaluations récentes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Évaluations récentes</h2>
          <Link to="/dashboard/evaluations" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Voir toutes les évaluations
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Rakoto Jean', poste: 'Développeur', date: '12/06/2026', score: 85, statut: 'Complète' },
                { name: 'Rabe Marie', poste: 'Designer', date: '10/06/2026', score: 92, statut: 'Complète' },
                { name: 'Andria Paul', poste: 'Manager', date: '08/06/2026', score: 78, statut: 'En cours' },
                { name: 'Rasoanaivo Lala', poste: 'Marketing', date: '05/06/2026', score: 88, statut: 'Complète' },
              ].map((evaluation, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evaluation.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evaluation.poste}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evaluation.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">{evaluation.score}/100</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${evaluation.score}%`,
                            backgroundColor: evaluation.score >= 80 ? '#10B981' : evaluation.score >= 50 ? '#F59E0B' : '#EF4444',
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        evaluation.statut === 'Complète'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {evaluation.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
