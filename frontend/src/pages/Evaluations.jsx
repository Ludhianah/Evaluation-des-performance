import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate } from "react-router-dom";

const Evaluations = () => {

  const { employeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employe_id: employeId || '',
    indicateur_id: '',
    realisation: '',
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });

  const [employees, setEmployees] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);

  const token = localStorage.getItem('token');

  // ===============================
  // CHARGEMENT INITIAL
  // ===============================
  useEffect(() => {

    fetchEmployees();
    fetchIndicateurs();

    if (employeId) {
      setFormData(prev => ({
        ...prev,
        employe_id: employeId
      }));
    }

  }, [employeId]);

  // ===============================
  // FETCH EMPLOYES
  // ===============================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/employes/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des employés");
    }
  };

  // ===============================
  // FETCH INDICATEURS
  // ===============================
  const fetchIndicateurs = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/indicateurs/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIndicateurs(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des indicateurs");
    }
  };

  // ===============================
  // SUBMIT EVALUATION
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        'http://localhost:8000/evaluations/',
        {
          employe_id: parseInt(formData.employe_id),
          indicateur_id: parseInt(formData.indicateur_id),
          realisation: parseFloat(formData.realisation),
          mois: formData.mois,
          annee: formData.annee
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess("Évaluation ajoutée avec succès");

      // redirection vers résultat
      setTimeout(() => {
        navigate(`/dashboard/evaluation-result/${formData.employe_id}`);
      }, 1000);

      setFormData({
        ...formData,
        indicateur_id: '',
        realisation: ''
      });

    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">
        Évaluation de l'employé
      </h1>

      <div className="bg-white shadow rounded-lg p-6">

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* SELECT EMPLOYE */}
          {!employeId && (
            <select
              required
              value={formData.employe_id}
              onChange={(e) =>
                setFormData({ ...formData, employe_id: e.target.value })
              }
              className="w-full border rounded p-2"
            >
              <option value="">Sélectionner un employé</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          )}

          {/* INDICATEUR */}
          <select
            required
            value={formData.indicateur_id}
            onChange={(e) =>
              setFormData({ ...formData, indicateur_id: e.target.value })
            }
            className="w-full border rounded p-2"
          >
            <option value="">Sélectionner un indicateur</option>
            {indicateurs.map(i => (
              <option key={i.id} value={i.id}>
                {i.libelle}
              </option>
            ))}
          </select>

          {/* REALISATION */}
          <input
            type="number"
            required
            placeholder="Réalisation"
            value={formData.realisation}
            onChange={(e) =>
              setFormData({ ...formData, realisation: e.target.value })
            }
            className="w-full border rounded p-2"
          />

          {/* MOIS */}
          <select
            value={formData.mois}
            onChange={(e) =>
              setFormData({ ...formData, mois: parseInt(e.target.value) })
            }
            className="w-full border rounded p-2"
          >
            <option value={1}>Janvier</option>
            <option value={2}>Février</option>
            <option value={3}>Mars</option>
            <option value={4}>Avril</option>
            <option value={5}>Mai</option>
            <option value={6}>Juin</option>
            <option value={7}>Juillet</option>
            <option value={8}>Août</option>
            <option value={9}>Septembre</option>
            <option value={10}>Octobre</option>
            <option value={11}>Novembre</option>
            <option value={12}>Décembre</option>
          </select>

          {/* ANNEE */}
          <select
            value={formData.annee}
            onChange={(e) =>
              setFormData({ ...formData, annee: parseInt(e.target.value) })
            }
            className="w-full border rounded p-2"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            {loading ? "Enregistrement..." : "Ajouter"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Evaluations;