import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentChartBarIcon, ChartBarIcon, UsersIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const Reports = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [filters, setFilters] = useState({
    service_id: '',
    user_id: '',
    mois: '',
    annee: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEvaluations();
    fetchServices();
    fetchUsers();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/evaluations/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvaluations(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des évaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/services/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setServices(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/auth/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    return (
      (!filters.service_id || evaluation.indicateur?.objectif?.service_id === parseInt(filters.service_id)) &&
      (!filters.user_id || evaluation.employe === filters.user_id) &&
      (!filters.mois || evaluation.mois === parseInt(filters.mois)) &&
      (!filters.annee || evaluation.annee === parseInt(filters.annee))
    );
  });

  const getAverageScore = () => {
    if (filteredEvaluations.length === 0) return 0;
    const total = filteredEvaluations.reduce((sum, evaluation) => sum + evaluation.note, 0);
    return (total / filteredEvaluations.length).toFixed(2);
  };

  const getEvaluationStats = () => {
    const stats = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    };
    
    filteredEvaluations.forEach(evaluation => {
      if (evaluation.note >= 90) stats.excellent++;
      else if (evaluation.note >= 75) stats.good++;
      else if (evaluation.note >= 50) stats.average++;
      else stats.poor++;
    });
    
    return stats;
  };

  const stats = getEvaluationStats();
  const averageScore = getAverageScore();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <DocumentChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapports d'Évaluation</h1>
            <p className="text-gray-500">Analyse complète des performances pour tous les employés et services</p>
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres de Recherche</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              name="service_id"
              value={filters.service_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les services</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
            <select
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les employés</option>
              {users.map((user) => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select
              name="mois"
              value={filters.mois}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les mois</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(mois => (
                <option key={mois} value={mois}>{new Date(2023, mois-1).toLocaleString('fr-FR', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select
              name="annee"
              value={filters.annee}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Toutes les années</option>
              {[2023, 2024, 2025, 2026].map(annee => (
                <option key={annee} value={annee}>{annee}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Note Moyenne</p>
              <p className="text-2xl font-bold">{averageScore}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Évaluations</p>
              <p className="text-2xl font-bold">{filteredEvaluations.length}</p>
            </div>
            <UsersIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Services Couverts</p>
              <p className="text-2xl font-bold">{new Set(filteredEvaluations.map(e => e.indicateur?.objectif?.service_id)).size}</p>
            </div>
            <BuildingOffice2Icon className="h-12 w-12 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Employés Évalués</p>
              <p className="text-2xl font-bold">{new Set(filteredEvaluations.map(e => e.employe)).size}</p>
            </div>
            <UsersIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution des Performances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
            <div className="text-sm text-green-700">Excellent (≥90%)</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.good}</div>
            <div className="text-sm text-blue-700">Bon (75-89%)</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.average}</div>
            <div className="text-sm text-yellow-700">Moyen (50-74%)</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.poor}</div>
            <div className="text-sm text-red-700">&Agrave; Améliorer (&lt;50%)</div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Détails des Évaluations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evaluation.employe}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evaluation.indicateur?.libelle || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {services.find(s => s.id === evaluation.indicateur?.objectif?.service_id)?.nom || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      evaluation.note >= 90 ? 'bg-green-100 text-green-800' :
                      evaluation.note >= 75 ? 'bg-blue-100 text-blue-800' :
                      evaluation.note >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {evaluation.note}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evaluation.mois}/{evaluation.annee}
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

export default Reports;