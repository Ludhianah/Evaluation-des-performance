import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusCircleIcon,
  UserGroupIcon,
  ScaleIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Evaluations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employe_id: '',
    indicateur_id: '',
    realisation: ''
  });

  const [employees, setEmployees] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [selectedIndicateur, setSelectedIndicateur] = useState(null);
  const [calculatedScore, setCalculatedScore] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchIndicateurs();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/services/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allEmployees = response.data.flatMap(service => service.employes || []);
      setEmployees(allEmployees);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIndicateurs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/indicateurs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIndicateurs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIndicateurChange = (indicateurId) => {
    const indicateur = indicateurs.find(ind => ind.id === parseInt(indicateurId));
    setSelectedIndicateur(indicateur);
    setFormData({ ...formData, indicateur_id: indicateurId });

    if (formData.realisation) {
      calculateScore(parseFloat(formData.realisation), indicateur);
    }
  };

  const handleRealisationChange = (realisation) => {
    setFormData({ ...formData, realisation });
    if (selectedIndicateur) {
      calculateScore(parseFloat(realisation), selectedIndicateur);
    }
  };

  const calculateScore = (realisation, indicateur) => {
    if (!realisation || !indicateur?.cible) {
      setCalculatedScore(null);
      return;
    }

    const cible = parseFloat(indicateur.cible);
    const real = parseFloat(realisation);

    let pourcentage = (real / cible) * 100;
    if (pourcentage > 100) pourcentage = 100;
    if (pourcentage < 0) pourcentage = 0;

    setCalculatedScore({ pourcentage: pourcentage.toFixed(0) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8000/evaluations/', {
        employe_id: parseInt(formData.employe_id),
        indicateur_id: parseInt(formData.indicateur_id),
        realisation: parseFloat(formData.realisation)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvaluationResults(prev => [
        ...prev,
        {
          indicateur: selectedIndicateur,
          realisation: parseFloat(formData.realisation),
          note: parseFloat(calculatedScore?.pourcentage || 0)
        }
      ]);

      setSuccess('Évaluation ajoutée au tableau !');
      setFormData({ employe_id: '', indicateur_id: '', realisation: '' });
      setSelectedIndicateur(null);
      setCalculatedScore(null);

    } catch (err) {
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const moyenne =
    evaluationResults.length > 0
      ? (
          evaluationResults.reduce((acc, curr) => acc + curr.note, 0) /
          evaluationResults.length
        ).toFixed(0)
      : 0;

  const quantitatifs = evaluationResults.filter(r => r.indicateur?.type === "QUANTITATIF");
  const qualitatifs = evaluationResults.filter(r => r.indicateur?.type === "QUALITATIF");

  // 🔹 Boutons navigation internes
  const navButtons = [
    { name: 'Services', icon: BuildingOffice2Icon, path: '/dashboard/services' },
    { name: 'Utilisateurs', icon: UsersIcon, path: '/dashboard/users' },
    { name: 'Objectifs', icon: ChartBarIcon, path: '/dashboard/objectifs' },
    { name: 'Indicateurs', icon: Cog6ToothIcon, path: '/dashboard/indicateurs' },
    { name: 'Rapports', icon: DocumentChartBarIcon, path: '/dashboard/reports' },
  ];

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold flex items-center justify-between">
        Nouvelle Évaluation

        {/* 🔹 Boutons de navigation */}
        <div className="flex space-x-2">
          {navButtons.map(btn => (
            <button
              key={btn.name}
              onClick={() => navigate(btn.path)}
              className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
            >
              <btn.icon className="h-4 w-4 mr-1" />
              {btn.name}
            </button>
          ))}
        </div>
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            value={formData.employe_id}
            onChange={(e) => setFormData({ ...formData, employe_id: e.target.value })}
            className="w-full border rounded p-2"
          >
            <option value="">Sélectionner un employé</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom} {e.prenom}
              </option>
            ))}
          </select>

          <select
            required
            value={formData.indicateur_id}
            onChange={(e) => handleIndicateurChange(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Sélectionner un indicateur</option>
            {indicateurs.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nom}
              </option>
            ))}
          </select>

          <input
            type="number"
            required
            value={formData.realisation}
            onChange={(e) => handleRealisationChange(e.target.value)}
            placeholder="Réalisation"
            className="w-full border rounded p-2"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Ajouter au tableau
          </button>
        </form>
      </div>

      {/* TABLEAU RESULTAT */}
      {evaluationResults.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Résultat de l’évaluation</h2>
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
              {quantitatifs.map((item, index) => (
                <tr key={"q" + index}>
                  {index === 0 && (
                    <td rowSpan={quantitatifs.length} className="border px-4 py-2 font-bold">
                      Quantitative
                    </td>
                  )}
                  <td className="border px-4 py-2">{item.indicateur.nom}</td>
                  <td className="border px-4 py-2">{item.indicateur.cible}</td>
                  <td className="border px-4 py-2">{item.realisation}</td>
                  <td className="border px-4 py-2">{item.note}%</td>
                </tr>
              ))}

              {qualitatifs.map((item, index) => (
                <tr key={"ql" + index}>
                  {index === 0 && (
                    <td rowSpan={qualitatifs.length} className="border px-4 py-2 font-bold">
                      Qualitative
                    </td>
                  )}
                  <td className="border px-4 py-2">{item.indicateur.nom}</td>
                  <td className="border px-4 py-2">{item.indicateur.cible || "Très bon"}</td>
                  <td className="border px-4 py-2">{item.realisation}</td>
                  <td className="border px-4 py-2">{item.note}%</td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-bold">
                <td className="border px-4 py-2">TOTAL / MOYENNE</td>
                <td className="border px-4 py-2">—</td>
                <td className="border px-4 py-2">—</td>
                <td className="border px-4 py-2">—</td>
                <td className="border px-4 py-2">{moyenne}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Evaluations;