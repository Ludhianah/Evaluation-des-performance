# Guide d'utilisation de l'API Évaluation

## Problème résolu
Erreur 401 Unauthorized sur `/services/` - L'endpoint nécessite une authentification JWT.

## Étapes pour utiliser l'API

### 1. Enregistrer un utilisateur (si ce n'est pas déjà fait)
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### 2. Se connecter pour obtenir un token JWT
```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password123"
```

**Réponse attendue:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### 3. Créer un service (avec authentification)
```bash
curl -X POST "http://localhost:8000/services/" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "IT Department"
  }'
```

### 4. Lister les services (sans authentification)
```bash
curl -X GET "http://localhost:8000/services/"
```

## Points importants

1. **Seuls les endpoints suivants nécessitent une authentification:**
   - `POST /services/` - Créer un service
   - `PUT /services/{id}` - Mettre à jour un service  
   - `DELETE /services/{id}` - Supprimer un service

2. **Les endpoints suivants sont publics:**
   - `GET /services/` - Lister tous les services
   - `GET /services/{id}` - Obtenir un service par ID

3. **Le token JWT doit être inclus dans l'en-tête:**
   ```
   Authorization: Bearer <votre_token_ici>
   ```

4. **Le token expire après 60 minutes** - il faut se reconnecter pour en obtenir un nouveau.

## Erreurs courantes

- **401 Unauthorized**: Token manquant, invalide ou expiré
- **400 Bad Request**: Username déjà utilisé (register) ou service déjà existant
- **404 Not Found**: Service non trouvé (update/delete)

## Utilisation avec Postman

1. **Register/Login**: Utilisez les endpoints `/auth/register` et `/auth/token`
2. **Copiez le token** de la réponse de login
3. **Dans l'onglet Authorization** de Postman:
   - Type: Bearer Token
   - Token: collez votre token ici
4. **Testez les endpoints protégés** avec le token configuré