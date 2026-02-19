import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import * as Form from '@radix-ui/react-form';
import { Button, Card, Text } from '@radix-ui/themes';

const Login = () => {

  // ==============================
  // États locaux du formulaire
  // ==============================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Récupération du contexte d'authentification
  const { login, loading, error } = useAuth();

  // Navigation après connexion
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // ==============================
  // Fonction appelée lors du submit
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Appel de la fonction login du AuthContext
    const result = await login(username, password);

    // Redirection selon le rôle
    if (result.success) {
      if (result.user?.role === 'ADMIN') {
        navigate('/dashboard', { replace: true });
      } else if (result.user?.role === 'RESPONSABLE') {
        navigate('/dashboard/evaluations', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    // Conteneur principal pleine hauteur avec fond blanc
    <div className="min-h-screen bg-white flex items-center justify-center px-4">

      {/* Carte centrale Radix */}
      <Card className="w-full max-w-md shadow-xl rounded-2xl p-8 border border-gray-200">

        {/* ==============================
            En-tête du formulaire
        ============================== */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Connexion
          </h1>
          <Text size="2" color="gray">
            Accédez à votre espace d’évaluation
          </Text>
        </div>

        {/* ==============================
            Formulaire Radix
        ============================== */}
        <Form.Root onSubmit={handleSubmit} className="space-y-6">

          {/* Affichage erreur backend */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* ==============================
              Champ Nom d'utilisateur
          ============================== */}
          <Form.Field name="username">
            <Form.Label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </Form.Label>

            <Form.Control asChild>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                  w-full px-4 py-2 
                  border border-gray-300 
                  rounded-lg 
                  focus:outline-none 
                  focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 
                  transition
                "
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </Form.Control>

            <Form.Message
              className="text-red-500 text-xs mt-1"
              match="valueMissing"
            >
              Veuillez saisir votre nom d'utilisateur
            </Form.Message>
          </Form.Field>

          {/* ==============================
              Champ Mot de passe
          ============================== */}
          <Form.Field name="password">
            <Form.Label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </Form.Label>

            <Form.Control asChild>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full px-4 py-2 
                  border border-gray-300 
                  rounded-lg 
                  focus:outline-none 
                  focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 
                  transition
                "
                placeholder="Entrez votre mot de passe"
                required
              />
            </Form.Control>

            <Form.Message
              className="text-red-500 text-xs mt-1"
              match="valueMissing"
            >
              Veuillez saisir votre mot de passe
            </Form.Message>
          </Form.Field>

          {/* ==============================
              Bouton principal
          ============================== */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full 
              bg-blue-600 hover:bg-blue-700 
              text-white 
              py-3 
              rounded-lg 
              font-medium 
              transition 
              disabled:opacity-50
            "
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>

        </Form.Root>

        {/* ==============================
            Lien inscription
        ============================== */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Créer un compte
          </Link>
        </div>

      </Card>
    </div>
  );
};

export default Login;
