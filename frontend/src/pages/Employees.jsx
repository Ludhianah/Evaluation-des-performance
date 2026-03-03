import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    poste: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/employes/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.nom.toLowerCase().includes(search.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        matricule: formData.matricule,
        nom: formData.nom,
        poste: formData.poste
      };

      if (editingEmployee) {
        await axios.put(
          `http://localhost:8000/employes/${editingEmployee.id}`,
          employeeData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:8000/employes/',
          employeeData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({ matricule: '', nom: '', poste: '' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await axios.delete(
          `http://localhost:8000/employes/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchEmployees();
      } catch (err) {
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
            <p className="text-gray-500">Gestion des employés</p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nouvel Employé
        </button>
      </div>

      {/* Recherche */}
      <div>
        <input
          type="text"
          placeholder="Rechercher par nom ou matricule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {employee.matricule}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-900">
                      {employee.nom}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {employee.poste || 'Non spécifié'}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {employee.service?.nom || 'Service inconnu'}
                </td>

                <td className="px-6 py-4 text-sm font-medium space-x-3">

                  {/* Bouton Évaluer */}
                  <button
                    onClick={() => navigate(`/evaluation/${employee.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Évaluer
                  </button>

                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(employee.id)}
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

      {/* Modal reste identique */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="text-lg font-medium mb-4">
              {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                required
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Poste"
                value={formData.poste}
                onChange={(e) => setFormData({...formData, poste: e.target.value})}
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editingEmployee ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;