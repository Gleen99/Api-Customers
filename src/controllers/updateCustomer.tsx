import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Customer from "../models/orders/CustomersModels";
import {rabbitMQClient} from "../../rabbitmq";


export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
        res.status(400).json({ message: 'ID du customer invalide' });
        return;
    }

    try {
        const product = await Customer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!product) {
            res.status(404).json({ message: 'Produit non trouvé' });
            return;
        }

        // Publier un message dans RabbitMQ
        await rabbitMQClient.publishMessage('produit_mis_a_jour', JSON.stringify(product));

        res.status(200).json(product);
    } catch (err) {
        console.error('Error in updateProduct:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
