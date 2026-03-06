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
    fetchEmployees();
    fetchEvaluations();
  }, []);

  const fetchEmployees = async () => {
    try {
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

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/evaluations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvaluations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getEmployeeScore = (employeeId) => {
    const evalEmp = evaluations.find(e => e.employe.id === employeeId);
    return evalEmp ? evalEmp.total_score : null;
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

    setFormData({
      matricule: '',
      nom: '',
      poste: ''
    });

    setIsModalOpen(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 font-bold";
    if (score >= 60) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
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

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div className="flex items-center space-x-3">

          <div className="p-2 bg-blue-100 rounded-lg">
            <UserIcon className="h-6 w-6 text-blue-600"/>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employés
            </h1>
            <p className="text-gray-500">
              Gestion des employés
            </p>
          </div>

        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2"/>
          Nouvel Employé
        </button>

      </div>


      {/* RECHERCHE */}

      <input
        type="text"
        placeholder="Rechercher par nom ou matricule..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="w-full md:w-1/3 border border-gray-300 rounded-md px-3 py-2"
      />



      {/* TABLEAU */}

      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Matricule
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Poste
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Score
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>

            </tr>

          </thead>


          <tbody className="bg-white divide-y divide-gray-200">

            {filteredEmployees.map((employee)=>{

              const score = getEmployeeScore(employee.id);

              return (

                <tr key={employee.id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {employee.matricule}
                  </td>


                  <td className="px-6 py-4">

                    <div className="flex items-center">

                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white"/>
                      </div>

                      <div className="ml-4 text-sm font-medium text-gray-900">
                        {employee.nom}
                      </div>

                    </div>

                  </td>


                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.poste || "Non spécifié"}
                  </td>


                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.service?.nom || "Service inconnu"}
                  </td>


                  <td className="px-6 py-4 text-sm">

                    {score !== null ? (

                      <span className={getScoreColor(score)}>
                        {score.toFixed(1)} %
                      </span>

                    ) : (

                      <span className="text-gray-400">
                        Non évalué
                      </span>

                    )}

                  </td>


                  <td className="px-6 py-4 text-sm font-medium space-x-3">

                    {score !== null ? (

                      <button
                        onClick={()=>navigate(`/dashboard/evaluation-result/${employee.id}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Voir résultat
                      </button>

                    ) : (

                      <button
                        onClick={()=>navigate(`/dashboard/evaluations/${employee.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Évaluer
                      </button>

                    )}

                    <button
                      onClick={()=>handleEdit(employee)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5"/>
                    </button>

                    <button
                      onClick={()=>handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5"/>
                    </button>

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default Employees;