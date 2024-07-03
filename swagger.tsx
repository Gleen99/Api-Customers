import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de gestion des clients',
        version: '1.0.0',
        description: 'API pour la création et la gestion des clients',
    },
    servers: [
        {
            url: '/v1/orders',
            description: 'Serveur de développement',
        },
    ],
    components: {
        schemas: {
            Order: {
                type: 'object',
                required: ['customerId', 'products'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID unique de la commande',
                    },
                    customerId: {
                        type: 'string',
                        description: 'ID du client',
                    },
                    products: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'ID du produit',
                                },
                                name: {
                                    type: 'string',
                                    description: 'Nom du produit',
                                },
                                details: {
                                    type: 'object',
                                    properties: {
                                        price: {
                                            type: 'string',
                                            description: 'Prix du produit',
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Description du produit',
                                        },
                                        color: {
                                            type: 'string',
                                            description: 'Couleur du produit',
                                        },
                                    },
                                },
                                stock: {
                                    type: 'integer',
                                    description: 'Stock disponible',
                                },
                                orderId: {
                                    type: 'string',
                                    description: 'ID de la commande associée',
                                },
                            },
                        },
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date de création de la commande',
                    },
                },
            },
        },
    },
};

const options: swaggerJSDoc.Options = {
    swaggerDefinition,
    apis: ['./src/routes/*.tsx']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
