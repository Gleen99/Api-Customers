import { Request, Response } from 'express';
import Customer from "../models/orders/CustomersModels";
import {fetchOrderDetails} from "../consumers/orderService";

export const getCustomerOrder = async (req: Request, res: Response) => {
    const { customerId, orderId } = req.params;

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        const orderDetails = await fetchOrderDetails(customerId, orderId);
        if (!orderDetails) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        res.status(200).json(orderDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande du client:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error instanceof Error ? error.message : String(error) });
    }
};
