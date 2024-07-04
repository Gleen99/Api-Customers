import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Customer from "../models/orders/CustomersModels";
import {rabbitMQClient} from "../../rabbitmq";

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
        res.status(400).json({ message: 'ID du customer invalide' });
        return;
    }

    try {
        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            res.status(404).json({ message: 'Customer non trouvé' });
            return;
        }

        // Publier un message dans RabbitMQ
        await rabbitMQClient.publishMessage('customer_supprime', JSON.stringify({ id }));

        res.status(200).json({ message: 'Customer supprimé avec succès' });
    } catch (err) {
        console.error('Error in deleteCustomer:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
