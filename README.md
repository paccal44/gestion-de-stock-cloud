# TP Microservices Gestion de Stock

Ce projet propose une architecture simple de gestion de stock en microservices avec `Express`, `nodemon`, `bcrypt` et `MongoDB` via `mongoose`.

## Services

- `auth-service` : inscription, connexion, récupération de mot de passe simulée
- `product-service` : CRUD produits
- `order-service` : création, mise à jour et annulation des commandes
- `inventory-service` : gestion des niveaux de stock et mouvements

## Technologies

- `Node.js`
- `Express`
- `Nodemon`
- `Bcrypt`
- `MongoDB`
- `Mongoose`

## Installation

```bash
npm install
```

## Configuration base de donnees

1. Copier le fichier d'exemple :

```bash
copy .env.example .env
```

2. Verifier que MongoDB tourne en local sur :

```bash
mongodb://127.0.0.1:27017/gestion_stock_tp
```

Vous pouvez aussi changer l'URI avec la variable `MONGODB_URI`.

## Lancement des services

Chaque service s'exécute sur un port différent :

- `auth-service` : `http://localhost:3001`
- `product-service` : `http://localhost:3002`
- `order-service` : `http://localhost:3003`
- `inventory-service` : `http://localhost:3004`

Dans quatre terminaux séparés :

```bash
npm run dev:auth
npm run dev:products
npm run dev:orders
npm run dev:inventory
```

## Endpoints principaux

### Auth Service

- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `GET /users`

### Product Service

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

### Order Service

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `PATCH /orders/:id/cancel`

### Inventory Service

- `GET /stocks`
- `GET /stocks/:productId`
- `POST /stocks`
- `POST /stocks/in`
- `POST /stocks/out`
- `GET /movements`

## Remarques

- Le stockage utilise MongoDB.
- Pour un microservices reel, chaque service aurait idealement sa propre base ou son propre schema.
- Les autorisations sont simulées via un en-tête `x-user-role`.

## Exemple rapide

Créer un utilisateur :

```bash
curl -X POST http://localhost:3001/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"123456\",\"role\":\"admin\"}"
```

Créer un produit :

```bash
curl -X POST http://localhost:3002/products ^
  -H "Content-Type: application/json" ^
  -H "x-user-role: admin" ^
  -d "{\"name\":\"Clavier\",\"description\":\"Clavier mecanique\",\"price\":450,\"quantity\":20}"
```
