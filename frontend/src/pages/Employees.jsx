import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Employees = () => {

  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
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
    fetchEmployeesAndEvaluations();
  }, []);

  const fetchEmployeesAndEvaluations = async () => {
    try {
      setLoading(true);
      const empRes = await axios.get('http://localhost:8000/employes/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(empRes.data);

      const evalRes = await axios.get('http://localhost:8000/evaluations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvaluations(evalRes.data);

    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const hasEvaluation = (employeeId) => {
    return evaluations.some(e => e.employe?.id === employeeId);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.nom.toLowerCase().includes(search.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = { ...formData };

      if (editingEmployee) {
        await axios.put(`http://localhost:8000/employes/${editingEmployee.id}`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8000/employes/', employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({ matricule: '', nom: '', poste: '' });

      await fetchEmployeesAndEvaluations();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout/modification de l'employé");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet employé ?')) return;

    try {
      await axios.delete(`http://localhost:8000/employes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchEmployeesAndEvaluations();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
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
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserIcon className="h-6 w-6 text-blue-600"/>
          </div>
          <h1 className="text-2xl font-bold">Employés</h1>
        </div>

        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2"/>
          Nouvel Employé
        </button>
      </div>

      {/* RECHERCHE */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-1/3"
      />

      {/* TABLEAU */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Matricule</th>
            <th className="border p-2">Nom</th>
            <th className="border p-2">Poste</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td className="border p-2">{employee.matricule}</td>
              <td className="border p-2">{employee.nom}</td>
              <td className="border p-2">{employee.poste}</td>
              <td className="border p-2 space-x-2">
                {hasEvaluation(employee.id) ? (
                  <button
                    onClick={()=>navigate(`/dashboard/evaluation-result/${employee.id}`)}
                    className="text-green-600"
                  >
                    Voir résultat
                  </button>
                ) : (
                  <button
                    onClick={()=>navigate(`/dashboard/evaluations/${employee.id}`)}
                    className="text-blue-600"
                  >
                    Évaluer
                  </button>
                )}

                <button
                  onClick={()=>handleEdit(employee)}
                  className="text-indigo-600"
                >
                  <PencilIcon className="h-5 w-5"/>
                </button>

                <button
                  onClick={()=>handleDelete(employee.id)}
                  className="text-red-600"
                >
                  <TrashIcon className="h-5 w-5"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL AJOUT / MODIF EMPLOYE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-4">
              {editingEmployee ? "Modifier Employé" : "Nouvel Employé"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Matricule"
                value={formData.matricule}
                onChange={(e)=>setFormData({...formData, matricule:e.target.value})}
                className="border p-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e)=>setFormData({...formData, nom:e.target.value})}
                className="border p-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Poste"
                value={formData.poste}
                onChange={(e)=>setFormData({...formData, poste:e.target.value})}
                className="border p-2 w-full"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={()=>setIsModalOpen(false)}
                  className="px-3 py-2 bg-gray-400 text-white rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Enregistrer
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