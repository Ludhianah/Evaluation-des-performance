import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EvaluationResult = () => {

  const { employeId } = useParams(); // ⚡ Corrigé ici
  const token = localStorage.getItem("token");

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeId) fetchEmployeeEvaluations();
  }, [employeId]);

  const fetchEmployeeEvaluations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/evaluations/employe/${employeId}`, // ⚡ utilise employeId
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEvaluations(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des évaluations :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Résultat d'évaluation</h1>

      {evaluations && evaluations.length > 0 ? (
        evaluations.map((evaluation) => (
          <div key={evaluation.evaluation_id} className="mb-6 border p-4 rounded">
            <h2 className="font-semibold mb-2">
              Mois : {evaluation.mois} / {evaluation.annee}
            </h2>
            <p className="mb-2">Score total : {evaluation.score_total}</p>

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Indicateur</th>
                  <th className="border p-2">Objectif</th>
                  <th className="border p-2">Réalisation</th>
                  <th className="border p-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.details.map((d, index) => (
                  <tr key={index}>
                    <td className="border p-2">{d.indicateur}</td>
                    <td className="border p-2">{d.objectif}</td>
                    <td className="border p-2">{d.realisation}</td>
                    <td className="border p-2">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Aucune évaluation trouvée.</p>
      )}
    </div>
  );
};

export default EvaluationResult;