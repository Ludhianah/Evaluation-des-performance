import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import * as Form from '@radix-ui/react-form';
import { Button, Card, Text } from '@radix-ui/themes';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      if (result.user?.role === 'ADMIN') navigate('/dashboard', { replace: true });
      else if (result.user?.role === 'RESPONSABLE') navigate('/dashboard/evaluations', { replace: true });
      else navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm shadow-2xl rounded-xl p-6 border border-gray-200">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <Text size="2" color="gray" className="mt-1">
            Accédez à votre espace d’évaluation
          </Text>
        </div>

        <Form.Root onSubmit={handleSubmit} className="space-y-5">

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Nom d'utilisateur */}
          <Form.Field name="username">
            <Form.Label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </Form.Control>
            <Form.Message className="text-red-500 text-xs mt-1" match="valueMissing">
              Veuillez saisir votre nom d'utilisateur
            </Form.Message>
          </Form.Field>

          {/* Mot de passe */}
          <Form.Field name="password">
            <Form.Label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </Form.Label>
            <Form.Control asChild>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Entrez votre mot de passe"
                required
              />
            </Form.Control>
            <Form.Message className="text-red-500 text-xs mt-1" match="valueMissing">
              Veuillez saisir votre mot de passe
            </Form.Message>
          </Form.Field>

          {/* Bouton */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </Form.Root>

        {/* Lien inscription */}
        <div className="mt-5 text-center text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Créer un compte
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;