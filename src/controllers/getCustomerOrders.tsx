import { Request, Response } from 'express';
import Customer from "../models/orders/CustomersModels";
import { requestOrderDetails } from "../consumers/requestOrderDetails";

export const getCustomerOrders = async (req: Request, res: Response) => {
    const { customerId } = req.params;

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        const orders = await requestOrderDetails(customerId);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes du client:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error instanceof Error ? error.message : String(error) });
    }
};

