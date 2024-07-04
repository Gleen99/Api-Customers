import express from 'express';
import { getCustomers } from '../controllers/getCustomers';
import { getCustomer } from '../controllers/getCustomer';
import { updateCustomer } from '../controllers/updateCustomer';
import { deleteCustomer } from '../controllers/deleteCustomer';
import { createCustomer } from "../controllers/createCustomer";
import { getCustomerOrders } from "../controllers/getCustomerOrders";
import { getCustomerOrder } from "../controllers/getCustomerOrder";
import { getCustomerOrderProducts } from "../controllers/getCustomerOrderProducts";
import { getCustomerOrderProduct } from "../controllers/getCustomerOrderProduct";

const router = express.Router();

/**
* @swagger
* components:
*   securitySchemes:
    *     ApiKeyAuth:
    *       type: apiKey
*       in: header
*       name: Authorization
*   schemas:
*     Address:
    *       type: object
*       properties:
*         postalCode:
    *           type: string
*         city:
*           type: string
*     Profile:
*       type: object
*       properties:
*         firstName:
    *           type: string
*         lastName:
*           type: string
*     Company:
*       type: object
*       properties:
*         companyName:
    *           type: string
*     Order:
*       type: object
*       properties:
*         createdAt:
    *           type: string
*           format: date-time
*         id:
*           type: string
*         customerId:
*           type: string
*     Customer:
*       type: object
*       properties:
*         createdAt:
    *           type: string
*           format: date-time
*         name:
*           type: string
*         username:
*           type: string
*         firstName:
*           type: string
*         lastName:
*           type: string
*         address:
*           $ref: '#/components/schemas/Address'
*         profile:
*           $ref: '#/components/schemas/Profile'
*         company:
*           $ref: '#/components/schemas/Company'
*         id:
*           type: string
*         orders:
*           type: array
*           items:
*             $ref: '#/components/schemas/Order'
*/

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Récupérer une liste de clients
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
router.get('/', getCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Récupérer un client par son identifiant
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Client non trouvé
 */
router.get('/:id', getCustomer);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Créer un nouveau client
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Mettre à jour un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Client mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Client non trouvé
 */
router.put('/:id', updateCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client supprimé avec succès
 *       404:
 *         description: Client non trouvé
 */
router.delete('/:id', deleteCustomer);

/**
 * @swagger
 * /customers/{customerId}/orders:
 *   get:
 *     summary: Récupérer les commandes d'un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des commandes du client
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: Client non trouvé
 */
router.get('/:customerId/orders', getCustomerOrders);

/**
 * @swagger
 * /customers/{customerId}/orders/{orderId}:
 *   get:
 *     summary: Récupérer une commande spécifique d'un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Identifiant de la commande
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la commande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Client ou commande non trouvé
 */
router.get('/:customerId/orders/:orderId', getCustomerOrder);

/**
 * @swagger
 * /customers/{customerId}/orders/{orderId}/products:
 *   get:
 *     summary: Récupérer les produits d'une commande spécifique d'un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Identifiant de la commande
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des produits de la commande
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Client ou commande non trouvé
 */
router.get('/:customerId/orders/:orderId/products', getCustomerOrderProducts);

/**
 * @swagger
 * /customers/{customerId}/orders/{orderId}/products/{productId}:
 *   get:
 *     summary: Récupérer un produit spécifique d'une commande d'un client
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: Identifiant du client
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Identifiant de la commande
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Identifiant du produit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Client, commande ou produit non trouvé
 */
router.get('/:customerId/orders/:orderId/products/:productId', getCustomerOrderProduct);

export default router;
