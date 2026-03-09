import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EvaluationResult = () => {
  const { employeId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeId) fetchEmployeeEvaluations();
  }, [employeId]);

  const fetchEmployeeEvaluations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/evaluations/employe/${employeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluations(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des évaluations :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evaluationId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette évaluation ?")) return;

    try {
      await axios.delete(
        `http://localhost:8000/evaluations/${evaluationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluations(evaluations.filter((e) => e.evaluation_id !== evaluationId));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // On filtre pour garder uniquement les évaluations avec des détails
  const evaluationsWithDetails = evaluations.filter(e => e.details.length > 0);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Résultats des évaluations
        </h1>
        <button
          onClick={() => navigate(`/dashboard/evaluations/${employeId}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Nouvelle évaluation
        </button>
      </div>

      {/* CONTENU */}
      {evaluationsWithDetails.length > 0 ? (
        evaluationsWithDetails.map((evaluation) => (
          <div
            key={evaluation.evaluation_id}
            className="bg-white shadow rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">
                Mois : {evaluation.mois} / {evaluation.annee}
              </h2>
              <button
                onClick={() => handleDelete(evaluation.evaluation_id)}
                className="bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 transition"
              >
                Supprimer
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Type", "Indicateur", "Objectif", "Réalisation", "Note"].map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {evaluation.details.map((d, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-700">{d.type || "N/A"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{d.indicateur}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{d.objectif}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{d.realisation}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {Number(d.note).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right text-sm text-gray-700">
                      Total
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {Number(evaluation.score_total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Aucune évaluation trouvée.</p>
      )}
    </div>
  );
};

export default EvaluationResult;