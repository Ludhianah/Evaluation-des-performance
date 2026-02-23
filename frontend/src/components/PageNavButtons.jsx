// src/components/PageNavButtons.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PageNavButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navButtons = [
    { name: 'Évaluations', path: '/dashboard/evaluations' },
    { name: 'Services', path: '/dashboard/services' },
    { name: 'Utilisateurs', path: '/dashboard/users' },
    { name: 'Objectifs', path: '/dashboard/objectifs' },
    { name: 'Indicateurs', path: '/dashboard/indicateurs' },
    { name: 'Rapports', path: '/dashboard/reports' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {navButtons.map(btn => (
        <button
          key={btn.name}
          onClick={() => navigate(btn.path)}
          className={`px-3 py-1 rounded font-medium text-sm transition-colors ${
            location.pathname === btn.path
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {btn.name}
        </button>
      ))}
    </div>
  );
};

export default PageNavButtons;