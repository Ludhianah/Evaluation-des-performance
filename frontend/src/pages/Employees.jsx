import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon, PencilIcon, TrashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    poste: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/employes/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEmployees(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        matricule: formData.matricule,
        nom: formData.nom,
        poste: formData.poste
      };

      if (editingEmployee) {
        await axios.put(`http://localhost:8000/employes/${editingEmployee.id}`, employeeData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Employé mis à jour avec succès');
      } else {
        await axios.post('http://localhost:8000/employes/', employeeData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Employé créé avec succès');
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({ matricule: '', nom: '', poste: '' });
      fetchEmployees();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || (editingEmployee ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
      console.error(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await axios.delete(`http://localhost:8000/employes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Employé supprimé avec succès');
        fetchEmployees();
      } catch (err) {
        console.error('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      matricule: employee.matricule,
      nom: employee.nom,
      poste: employee.poste
    });
    setIsModalOpen(true);
  };

  const openModal = () => {
    setEditingEmployee(null);
    setFormData({ matricule: '', nom: '', poste: '' });
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
            <p className="text-gray-500">Gestion des employés de votre service</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nouvel Employé
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.matricule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.poste || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {employee.service?.nom || 'Service inconnu'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Matricule</label>
                    <input
                      type="text"
                      required
                      value={formData.matricule}
                      onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Entrez le matricule"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Entrez le nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poste</label>
                    <input
                      type="text"
                      value={formData.poste}
                      onChange={(e) => setFormData({...formData, poste: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Entrez le poste (optionnel)"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    {editingEmployee ? 'Mettre à jour' : 'Créer'}
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

export default Employees;