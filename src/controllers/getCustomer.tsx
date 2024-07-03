import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Customer from "../models/orders/CustomersModels";
import {rabbitMQClient} from "../../rabbitmq";

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
        res.status(400).json({ message: 'ID du customer invalide' });
        return;
    }

    try {
        const customer = await Customer.findById(id);

        if (!customer) {
            res.status(404).json({ message: 'Customer non trouvé' });
            return;
        }

        // Publier un message dans RabbitMQ pour enregistrer l'accès
        await rabbitMQClient.publishMessage('customer_consulte', JSON.stringify({
            id: customer._id,
            timestamp: new Date(),
            userIp: req.ip
        }));

        res.status(200).json(customer);
    } catch (err) {
        console.error('Error in getCustomer:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};