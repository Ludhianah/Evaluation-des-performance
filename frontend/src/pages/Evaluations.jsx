import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useParams } from "react-router-dom";

const Evaluations = () => {

  const { employeId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employe_id: employeId || '',
    indicateur_id: '',
    realisation: ''
  });

  const [employees, setEmployees] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState([]);

  const token = localStorage.getItem('token');

  // ===============================
  // CHARGEMENT INITIAL
  // ===============================
  useEffect(() => {

    fetchEmployees();
    fetchIndicateurs();
    fetchEvaluations();

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
  // FETCH EVALUATIONS PAR EMPLOYE
  // ===============================
  const fetchEvaluations = async () => {

    try {

      const url = employeId
        ? `http://localhost:8000/evaluations/employe/${employeId}`
        : `http://localhost:8000/evaluations/`;

      const res = await axios.get(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = res.data
        .map(e =>
          e.details.map(d => ({
            indicateur: d.indicateur,
            realisation: d.realisation,
            note: d.note
          }))
        )
        .flat();

      setEvaluationResults(formatted);

    } catch (err) {

      console.error(err);
      setError("Erreur lors du chargement des évaluations");

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

      const res = await axios.post(
        'http://localhost:8000/evaluations/',
        {
          employe_id: parseInt(formData.employe_id),
          indicateur_id: parseInt(formData.indicateur_id),
          realisation: parseFloat(formData.realisation),
          mois: new Date().getMonth() + 1,
          annee: new Date().getFullYear()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const indicateurComplet = indicateurs.find(
        i => i.id === parseInt(formData.indicateur_id)
      );

      setEvaluationResults(prev => [
        ...prev,
        {
          indicateur: indicateurComplet,
          realisation: parseFloat(formData.realisation),
          note: res.data.note_calculée
        }
      ]);

      setSuccess("Évaluation ajoutée avec succès");

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
  // CALCUL MOYENNE
  // ===============================
  const moyenne =
    evaluationResults.length > 0
      ? (
          evaluationResults.reduce((acc, curr) => acc + curr.note, 0) /
          evaluationResults.length
        ).toFixed(0)
      : 0;

  // ===============================
  // FILTRE TYPE
  // ===============================
  const quantitatifs = evaluationResults.filter(
    r => r.indicateur?.type === "QUANTITATIF"
  );

  const qualitatifs = evaluationResults.filter(
    r => r.indicateur?.type === "QUALITATIF"
  );

  // ===============================
  // RENDER
  // ===============================
  return (

    <div className="space-y-8">

      <h1 className="text-2xl font-bold">
        Évaluation de l'employé
      </h1>

      {/* FORMULAIRE */}
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

      {/* TABLEAU RESULTAT */}
      {evaluationResults.length > 0 && (

        <div className="bg-white shadow rounded-lg p-6">

          <h2 className="text-lg font-semibold mb-4">
            Résultat de l’évaluation
          </h2>

          <table className="min-w-full border">

            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Indicateur</th>
                <th className="border px-4 py-2">Objectif</th>
                <th className="border px-4 py-2">Réalisation</th>
                <th className="border px-4 py-2">Note (%)</th>
              </tr>
            </thead>

            <tbody>

              {quantitatifs.map((item, i) => (
                <tr key={`q${i}`}>

                  {i === 0 && (
                    <td
                      rowSpan={quantitatifs.length}
                      className="border px-4 py-2 font-bold"
                    >
                      Quantitative
                    </td>
                  )}

                  <td className="border px-4 py-2">
                    {item.indicateur.libelle}
                  </td>

                  <td className="border px-4 py-2">
                    {item.indicateur.valeur_cible}
                  </td>

                  <td className="border px-4 py-2">
                    {item.realisation}
                  </td>

                  <td className="border px-4 py-2">
                    {item.note}
                  </td>

                </tr>
              ))}

              {qualitatifs.map((item, i) => (
                <tr key={`ql${i}`}>

                  {i === 0 && (
                    <td
                      rowSpan={qualitatifs.length}
                      className="border px-4 py-2 font-bold"
                    >
                      Qualitative
                    </td>
                  )}

                  <td className="border px-4 py-2">
                    {item.indicateur.libelle}
                  </td>

                  <td className="border px-4 py-2">
                    {item.indicateur.valeur_cible || "Très bon"}
                  </td>

                  <td className="border px-4 py-2">
                    {item.realisation}
                  </td>

                  <td className="border px-4 py-2">
                    {item.note}
                  </td>

                </tr>
              ))}

              <tr className="bg-gray-100 font-bold">

                <td className="border px-4 py-2">
                  TOTAL / MOYENNE
                </td>

                <td className="border px-4 py-2">—</td>
                <td className="border px-4 py-2">—</td>
                <td className="border px-4 py-2">—</td>

                <td className="border px-4 py-2">
                  {moyenne}%
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

};

export default Evaluations;