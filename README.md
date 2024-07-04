# API de Gestion des Clients

## Description
Cette API gère les clients pour un système de e-commerce. Elle permet de créer, lire, mettre à jour et supprimer des clients, ainsi que de gérer les commandes et produits associés à ces clients.

## Technologies Utilisées
- Node.js
- Express.js
- TypeScript
- MongoDB avec Mongoose
- RabbitMQ pour la messagerie
- Joi pour la validation des données
- Swagger pour la documentation de l'API

## Installation

1. Clonez le dépôt :
   ```
   https://github.com/Gleen99/Api-Customers
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

3. Configurez les variables d'environnement dans un fichier `.env` :
   ```
   PORT=19301
   MONGODB_URI=mongodb://localhost:27017/customers
   RABBITMQ_URL=amqp://localhost
   ```

4. Démarrez le serveur :
   ```
   npm start
   ```

## Structure du Projet

```
.
├── src/
│   ├── controllers/
│   │   ├── createCustomer.ts
│   │   ├── updateCustomer.ts
│   │   └── ...
│   ├── models/
│   │   └── orders/
│   │       └── CustomersModels.ts
│   ├── routes/
│   │   └── CustomersRoutes.ts
│   ├── services/
│   │   └── customerUtils.ts
│   ├── validator/
│   │   └── customerValidator.ts
│   ├── consumers/
│   │   └── requestOrderDetails.ts
│   └── app.ts
├── tests/
│   └── ...
├── swagger.ts
├── package.json
└── tsconfig.json
```

## Routes API

### 1. Obtenir tous les Clients
- **Méthode** : GET
- **Chemin** : `/customers`
- **Description** : Récupère la liste de tous les clients.
- **Réponse** : Liste des objets client

### 2. Obtenir un Client Spécifique
- **Méthode** : GET
- **Chemin** : `/customers/:id`
- **Description** : Récupère les détails d'un client spécifique.
- **Paramètres URL** :
    - `id` : ID du client
- **Réponse** : Objet du client

### 3. Créer un Client
- **Méthode** : POST
- **Chemin** : `/customers`
- **Description** : Crée un nouveau client.
- **Corps de la Requête** : Objet client (voir schéma Customer)
- **Réponse** : Objet du client créé

### 4. Mettre à Jour un Client
- **Méthode** : PUT
- **Chemin** : `/customers/:id`
- **Description** : Met à jour les informations d'un client existant.
- **Paramètres URL** :
    - `id` : ID du client
- **Corps de la Requête** : Objet client avec les champs à mettre à jour
- **Réponse** : Objet du client mis à jour

### 5. Supprimer un Client
- **Méthode** : DELETE
- **Chemin** : `/customers/:id`
- **Description** : Supprime un client spécifique.
- **Paramètres URL** :
    - `id` : ID du client
- **Réponse** : Message de confirmation

### 6. Obtenir les Commandes d'un Client
- **Méthode** : GET
- **Chemin** : `/customers/:customerId/orders`
- **Description** : Récupère toutes les commandes d'un client spécifique.
- **Paramètres URL** :
    - `customerId` : ID du client
- **Réponse** : Liste des commandes du client

### 7. Obtenir une Commande Spécifique d'un Client
- **Méthode** : GET
- **Chemin** : `/customers/:customerId/orders/:orderId`
- **Description** : Récupère une commande spécifique d'un client.
- **Paramètres URL** :
    - `customerId` : ID du client
    - `orderId` : ID de la commande
- **Réponse** : Objet de la commande

### 8. Obtenir les Produits d'une Commande d'un Client
- **Méthode** : GET
- **Chemin** : `/customers/:customerId/orders/:orderId/products`
- **Description** : Récupère tous les produits d'une commande spécifique d'un client.
- **Paramètres URL** :
    - `customerId` : ID du client
    - `orderId` : ID de la commande
- **Réponse** : Liste des produits de la commande

### 9. Obtenir un Produit Spécifique d'une Commande d'un Client
- **Méthode** : GET
- **Chemin** : `/customers/:customerId/orders/:orderId/products/:productId`
- **Description** : Récupère un produit spécifique d'une commande d'un client.
- **Paramètres URL** :
    - `customerId` : ID du client
    - `orderId` : ID de la commande
    - `productId` : ID du produit
- **Réponse** : Objet du produit

## Tests

Pour exécuter les tests :

A compléter

## Documentation Swagger

La documentation Swagger de l'API est disponible à l'adresse :
```
http://localhost:19301/api/v1/docs
```

## Gestion des Erreurs

L'API utilise des codes d'état HTTP standard pour indiquer le succès ou l'échec d'une requête API. Les erreurs sont renvoyées au format JSON avec un message descriptif.

Cette version mise à jour reflète la structure et les routes de votre API de gestion des clients, y compris les routes pour les commandes et les produits associés aux clients.