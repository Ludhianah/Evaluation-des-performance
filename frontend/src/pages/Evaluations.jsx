import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon, UserGroupIcon, ScaleIcon } from '@heroicons/react/24/outline';

const Evaluations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    employe_id: '',
    indicateur_id: '',
    realisation: ''
  });

  const [employees, setEmployees] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [selectedIndicateur, setSelectedIndicateur] = useState(null);
  const [calculatedScore, setCalculatedScore] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEmployees();
    fetchIndicateurs();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/services/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Flatten employees from all services
      const allEmployees = response.data.flatMap(service => service.employes || []);
      setEmployees(allEmployees);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIndicateurs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/indicateurs/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIndicateurs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIndicateurChange = (indicateurId) => {
    const indicateur = indicateurs.find(ind => ind.id === parseInt(indicateurId));
    setSelectedIndicateur(indicateur);
    setFormData({...formData, indicateur_id: indicateurId});
    
    // Calculate score if realization is already entered
    if (formData.realisation) {
      calculateScore(parseFloat(formData.realisation), indicateur);
    }
  };

  const handleRealisationChange = (realisation) => {
    setFormData({...formData, realisation});
    
    // Calculate score if indicateur is selected
    if (selectedIndicateur) {
      calculateScore(parseFloat(realisation), selectedIndicateur);
    }
  };

  const calculateScore = (realisation, indicateur) => {
    if (!realisation || !indicateur) {
      setCalculatedScore(null);
      return;
    }

    const cible = parseFloat(indicateur.cible);
    const real = parseFloat(realisation);
    
    // Calculate percentage
    const pourcentage = (real / cible) * 100;
    
    // Calculate score out of 20
    let score = (real / cible) * 20;
    
    // Cap score at 20
    if (score > 20) score = 20;
    if (score < 0) score = 0;

    setCalculatedScore({
      pourcentage: pourcentage.toFixed(2),
      score: score.toFixed(2),
      realisation: real,
      cible: cible
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8000/evaluations/', {
        employe_id: parseInt(formData.employe_id),
        indicateur_id: parseInt(formData.indicateur_id),
        realisation: parseFloat(formData.realisation)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Évaluation créée avec succès !');
      setFormData({ employe_id: '', indicateur_id: '', realisation: '' });
      setSelectedIndicateur(null);
      setCalculatedScore(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de l\'évaluation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Évaluation</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire d'évaluation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Formulaire d'évaluation
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employé</label>
              <select
                required
                value={formData.employe_id}
                onChange={(e) => setFormData({...formData, employe_id: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Sélectionner un employé</option>
                {employees.map((employe) => (
                  <option key={employe.id} value={employe.id}>
                    {employe.nom} {employe.prenom} - {employe.poste}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Indicateur</label>
              <select
                required
                value={formData.indicateur_id}
                onChange={(e) => handleIndicateurChange(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Sélectionner un indicateur</option>
                {indicateurs.map((indicateur) => (
                  <option key={indicateur.id} value={indicateur.id}>
                    {indicateur.nom} - {indicateur.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Réalisation ({selectedIndicateur?.unite || 'Unité'})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.realisation}
                onChange={(e) => handleRealisationChange(e.target.value)}
                placeholder={`Entrez la réalisation en ${selectedIndicateur?.unite || 'unité'}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.employe_id || !formData.indicateur_id || !formData.realisation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                {loading ? 'Enregistrement...' : 'Créer Évaluation'}
              </button>
            </div>
          </form>
        </div>

        {/* Calcul de la note */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ScaleIcon className="h-5 w-5 mr-2" />
            Calcul de la Note
          </h2>

          {selectedIndicateur && formData.realisation ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Détails de l'indicateur</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium">{selectedIndicateur.nom}</span>
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{selectedIndicateur.description}</span>
                  <span className="text-gray-600">Cible:</span>
                  <span className="font-medium">{selectedIndicateur.cible} {selectedIndicateur.unite}</span>
                  <span className="text-gray-600">Unité:</span>
                  <span className="font-medium">{selectedIndicateur.unite}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Calcul de performance</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-blue-600">Réalisation:</span>
                  <span className="font-medium text-blue-700">{formData.realisation} {selectedIndicateur.unite}</span>
                  <span className="text-blue-600">Pourcentage:</span>
                  <span className="font-medium text-blue-700">{calculatedScore?.pourcentage || '0.00'}%</span>
                  <span className="text-blue-600">Note sur 20:</span>
                  <span className="font-medium text-blue-700">{calculatedScore?.score || '0.00'}/20</span>
                </div>
              </div>

              {calculatedScore && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculatedScore.pourcentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Performance: {calculatedScore.pourcentage}%
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Sélectionnez un indicateur et entrez la réalisation pour voir le calcul de la note.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Sélectionnez un employé dans la liste déroulante</li>
          <li>Choisissez un indicateur à évaluer</li>
          <li>Entrez la réalisation obtenue par l'employé</li>
          <li>La note est calculée automatiquement en pourcentage et sur 20</li>
          <li>La note maximale est de 20, même si la performance dépasse la cible</li>
        </ul>
      </div>
    </div>
  );
};

export default Evaluations;