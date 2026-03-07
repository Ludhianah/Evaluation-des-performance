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
    if (employeId) {
      fetchEmployeeEvaluations();
    }
  }, [employeId]);

  const fetchEmployeeEvaluations = async () => {
    try {

      const response = await axios.get(
        `http://localhost:8000/evaluations/employe/${employeId}`,
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
    return <div className="p-6">Chargement...</div>;
  }

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-xl font-bold">
          Résultats des évaluations
        </h1>

        <button
          onClick={() => navigate(`/dashboard/evaluations/${employeId}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nouvelle évaluation
        </button>

      </div>

      {evaluations && evaluations.length > 0 ? (

        evaluations.map((evaluation) => (

          <div
            key={evaluation.evaluation_id}
            className="mb-6 border p-4 rounded"
          >

            <h2 className="font-semibold mb-3">
              Mois : {evaluation.mois} / {evaluation.annee}
            </h2>

            <table className="w-full border">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-2">Type</th>
                  <th className="border p-2">Indicateur</th>
                  <th className="border p-2">Objectif</th>
                  <th className="border p-2">Réalisation</th>
                  <th className="border p-2">Note</th>

                </tr>

              </thead>

              <tbody>

                {evaluation.details.map((d, index) => (

                  <tr key={index}>

                    <td className="border p-2">
                      {d.type || "N/A"}
                    </td>

                    <td className="border p-2">
                      {d.indicateur}
                    </td>

                    <td className="border p-2">
                      {d.objectif}
                    </td>

                    <td className="border p-2">
                      {d.realisation}
                    </td>

                    <td className="border p-2">
                      {d.note}
                    </td>

                  </tr>

                ))}

              </tbody>

              <tfoot>

                <tr className="bg-gray-100 font-semibold">

                  <td colSpan={4} className="border p-2 text-right">
                    Total
                  </td>

                  <td className="border p-2">
                    {evaluation.score_total}
                  </td>

                </tr>

              </tfoot>

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