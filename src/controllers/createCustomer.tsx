import { Request, Response } from 'express';
import { rabbitMQClient } from "../../rabbitmq";
import Customer from "../models/orders/CustomersModels";

export const createCustomer = async (req: Request, res: Response) => {
    const {
        name,
        username,
        firstName,
        lastName,
        address,
        profile,
        company
    } = req.body;

    if (!name || !username || !firstName || !lastName || !address || !profile || !company) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    try {
        // Créer le client dans la base de données
        const newCustomer = await Customer.create({
            name,
            username,
            firstName,
            lastName,
            address,
            profile,
            company,
        });

        // Publier un message pour informer de la création d'un nouveau client
        await rabbitMQClient.publishMessage('customer_created', JSON.stringify(newCustomer));

        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        res.status(500).json({ message: 'Erreur lors de la création du client', error });
    }
};
