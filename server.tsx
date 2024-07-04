import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import promClient from 'prom-client';
import swaggerUI from 'swagger-ui-express';
import winston from 'winston';
import { rabbitMQClient } from './rabbitmq';
import customersRoutes from "./src/routes/CustomersRoutes";
import { setupCustomerService } from "./src/services/customerServices";
import swaggerSpec from './swagger';

dotenv.config();

const app: Express = express();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Configuration des métriques Prometheus
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
app.get('/metrics', async (req: Request, res: Response) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Middlewares de sécurité
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
const isValidApiKey = (apiKey: string): boolean => {
    // Par exemple, vérifiez si la clé existe dans une base de données ou un fichier de configuration
    const validApiKeys = ['key1', 'key2', 'key3']; // Exemple simplifié
    return validApiKeys.includes(apiKey);
};
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || !isValidApiKey(apiKey)) {
        logger.warn(`Tentative d'accès non autorisé avec la clé API: ${apiKey}`);
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// Connexion à MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/customers');
        logger.info('Connecté à MongoDB');
    } catch (err) {
        logger.error('Erreur de connexion MongoDB:', err);
        process.exit(1);
    }
};

// Connexion à RabbitMQ et initialisation du consommateur
const connectToRabbitMQ = async () => {
    try {
        await rabbitMQClient.connect();
        logger.info('Connecté à RabbitMQ');
        await rabbitMQClient.setup();
        logger.info('Setup RabbitMQ terminé');
        await setupCustomerService();
        logger.info('Consommateurs initialisés');
    } catch (err) {
        logger.error('Erreur lors de la configuration de RabbitMQ:', err);
        process.exit(1);
    }
}

// Gestion des événements de connexion MongoDB
mongoose.connection.on('connected', () => {
    logger.info('Connexion à MongoDB réussie');
});

mongoose.connection.on('error', err => {
    logger.error('Erreur de connexion MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.info('Connexion à MongoDB interrompue');
});

// Définissez l'URL de base de votre API
const API_BASE_PATH = '/api/v1';

// Routes
app.use(`${API_BASE_PATH}/customers`,validateApiKey, customersRoutes);

// Route pour la documentation Swagger
app.use(`${API_BASE_PATH}/docs`, swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Gestion des erreurs sécurisée
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.name}: ${err.message}\n${err.stack}`);
    res.status(500).json({
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Fonction pour démarrer le serveur
const startServer = async () => {
    try {
        await connectToMongoDB();
        await connectToRabbitMQ();

        const PORT = 3000;
        app.listen(PORT, () => {
            logger.info(`Serveur démarré sur le port ${PORT}`);
            logger.info(`Documentation Swagger disponible sur http://localhost:${PORT}${API_BASE_PATH}/docs`);
        });
    } catch (error) {
        logger.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

// Démarrage du serveur
startServer();

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        await rabbitMQClient.closeConnection();
        logger.info('Connexions fermées proprement');
        process.exit(0);
    } catch (error) {
        logger.error('Erreur lors de la fermeture des connexions:', error);
        process.exit(1);
    }
});
