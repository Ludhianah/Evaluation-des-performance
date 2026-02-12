# Guide Docker - Application d'Évaluation des Performances

## Commandes Docker pour lancer l'application

### Commandes de base pour lancer l'application

#### 1. Lancer l'application avec Docker Compose (recommandé)
```bash
docker-compose up -d
```
Cette commande démarre les deux services (API et base de données) en arrière-plan.

#### 2. Lancer uniquement l'API
```bash
docker-compose up api
```

#### 3. Lancer uniquement la base de données
```bash
docker-compose up db
```

### Commandes de gestion

#### Vérifier l'état des services
```bash
docker-compose ps
```

#### Voir les logs
```bash
# Logs de tous les services
docker-compose logs

# Logs spécifiques à l'API
docker-compose logs api

# Logs spécifiques à la base de données
docker-compose logs db
```

#### Arrêter l'application
```bash
docker-compose down
```

#### Arrêter et supprimer les volumes (base de données)
```bash
docker-compose down -v
```

#### Reconstruire les images
```bash
docker-compose build
# ou
docker-compose up --build
```

## Accès à l'application

Une fois l'application lancée :

- **API FastAPI** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Base de données PostgreSQL** : localhost:5432 (database: evaluation_db)

## Structure de l'application

Votre application est une API FastAPI avec :

- **Backend** : FastAPI avec Tortoise ORM pour PostgreSQL
- **Base de données** : PostgreSQL 15
- **Authentification** : Hashage de mot de passe avec bcrypt
- **Fonctionnalités** : Génération de PDF et envoi d'emails

Les services sont configurés pour se lancer automatiquement avec les dépendances appropriées (l'API attend que la base de données soit prête).

## Services Docker

### API Service
- **Port** : 8000
- **Image** : Construite à partir du Dockerfile
- **Dépendances** : Base de données PostgreSQL
- **Environnement** : DATABASE_URL=postgresql://postgres:postgres@db:5432/evaluation_db

### Base de données Service
- **Image** : postgres:15
- **Port** : 5432
- **Utilisateur** : postgres
- **Mot de passe** : postgres
- **Base de données** : evaluation_db