import { Request, Response } from 'express';
import Customer from "../models/orders/CustomersModels";
import {rabbitMQClient} from "../../rabbitmq";

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await Customer.find();

        if (customers.length === 0) {
            res.status(404).json({ message: 'Aucun Client trouvé' });
            return;
        }

        // Publier un message dans RabbitMQ pour enregistrer l'accès à la liste des clients
        await rabbitMQClient.publishMessage('liste_customer_consultee', JSON.stringify({
            timestamp: new Date(),
            userIp: req.ip,
            count: customers.length
        }));

        res.status(200).json(customers);
    } catch (err) {
        console.error('Error in getCustomers:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
