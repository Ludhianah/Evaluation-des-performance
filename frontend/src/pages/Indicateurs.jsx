import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Indicateurs = () => {
  const [indicateurs, setIndicateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndicateur, setEditingIndicateur] = useState(null);
  
  const [formData, setFormData] = useState({
    libelle: '',
    description: '',
    type: 'QUANTITATIF',
    valeur_cible: '',
    unite: '',
    objectif_id: ''
  });

  const [objectifs, setObjectifs] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchIndicateurs();
    fetchObjectifs();
  }, []);

  const fetchIndicateurs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/indicateurs/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIndicateurs(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des indicateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchObjectifs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/objectifs/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setObjectifs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string values to proper types for backend
      const dataToSend = {
        libelle: formData.libelle,
        description: formData.description,
        type: formData.type,
        valeur_cible: formData.valeur_cible ? parseFloat(formData.valeur_cible) : null,
        unite: formData.unite,
        objectif_id: formData.objectif_id ? parseInt(formData.objectif_id) : null
      };

      if (editingIndicateur) {
        await axios.put(`http://localhost:8000/indicateurs/${editingIndicateur.id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post('http://localhost:8000/indicateurs/', dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      setIsModalOpen(false);
      setEditingIndicateur(null);
      setFormData({ libelle: '', description: '', type: 'QUANTITATIF', valeur_cible: '', unite: '', objectif_id: '' });
      fetchIndicateurs();
    } catch (err) {
      setError(editingIndicateur ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet indicateur ?')) {
      try {
        await axios.delete(`http://localhost:8000/indicateurs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchIndicateurs();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleEdit = (indicateur) => {
    setEditingIndicateur(indicateur);
    setFormData({
      libelle: indicateur.libelle,
      description: indicateur.description,
      type: indicateur.type || 'QUANTITATIF',
      valeur_cible: indicateur.valeur_cible,
      unite: indicateur.unite,
      objectif_id: indicateur.objectif_id
    });
    setIsModalOpen(true);
  };

  const openModal = () => {
    setEditingIndicateur(null);
    setFormData({ libelle: '', description: '', type: 'QUANTITATIF', valeur_cible: '', unite: '', objectif_id: '' });
    setIsModalOpen(true);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Indicateurs</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nouvel Indicateur
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicateurs.map((indicateur) => (
                <tr key={indicateur.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indicateur.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicateur.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {objectifs.find(obj => obj.id === indicateur.objectif_id)?.nom || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicateur.cible}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicateur.unite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(indicateur)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(indicateur.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingIndicateur ? 'Modifier Indicateur' : 'Nouvel Indicateur'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Libellé</label>
                    <input
                      type="text"
                      required
                      value={formData.libelle}
                      onChange={(e) => setFormData({...formData, libelle: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Objectif</label>
                    <select
                      required
                      value={formData.objectif_id}
                      onChange={(e) => setFormData({...formData, objectif_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionner un objectif</option>
                      {objectifs.map((objectif) => (
                        <option key={objectif.id} value={objectif.id}>{objectif.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="QUANTITATIF">Quantitatif</option>
                      <option value="QUALITATIF">Qualitatif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valeur Cible</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valeur_cible}
                      onChange={(e) => setFormData({...formData, valeur_cible: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unité</label>
                    <input
                      type="text"
                      required
                      value={formData.unite}
                      onChange={(e) => setFormData({...formData, unite: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingIndicateur ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indicateurs;