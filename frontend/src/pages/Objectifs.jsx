import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Objectifs = () => {
  const [objectifs, setObjectifs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState(null);
  
  const [formData, setFormData] = useState({
    libelle: '',
    date: '',       // Remplace mois et année
    service_id: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchObjectifs();
    fetchServices();
  }, []);

  const fetchObjectifs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/objectifs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObjectifs(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des objectifs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:8000/services/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (err) {
      console.error('Erreur services:', err);
    }
  };

  const getServiceName = (id) => {
    const service = services.find(s => s.id === id);
    return service ? service.nom : id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingObjectif) {
        await axios.put(`http://localhost:8000/objectifs/${editingObjectif.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8000/objectifs/', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingObjectif(null);
      setFormData({ libelle: '', date: '', service_id: '' });
      fetchObjectifs();
    } catch (err) {
      setError(editingObjectif ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      try {
        await axios.delete(`http://localhost:8000/objectifs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchObjectifs();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleEdit = (objectif) => {
    setEditingObjectif(objectif);
    setFormData({
      libelle: objectif.libelle,
      date: objectif.date,  // Récupère la date complète
      service_id: objectif.service_id
    });
    setIsModalOpen(true);
  };

  const openModal = () => {
    setEditingObjectif(null);
    setFormData({ libelle: '', date: '', service_id: '' });
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
        <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nouvel Objectif
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {objectifs.map((objectif) => (
                <tr key={objectif.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{objectif.libelle}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{objectif.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getServiceName(objectif.service_id)}</td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(objectif)} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(objectif.id)} className="text-red-600 hover:text-red-900">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingObjectif ? 'Modifier Objectif' : 'Nouvel Objectif'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Libellé</label>
                <input
                  type="text"
                  required
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">-- Choisir un service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingObjectif ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Objectifs;
