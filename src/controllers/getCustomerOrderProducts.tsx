import { Request, Response } from 'express';
import Customer from "../models/orders/CustomersModels";
import { fetchOrderDetails } from "../consumers/orderService";

export const getCustomerOrderProducts = async (req: Request, res: Response) => {
    const { customerId, orderId } = req.params;

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        const orderDetails = await fetchOrderDetails(customerId, orderId);

        let orderProducts = [];
        if (Array.isArray(orderDetails)) {
            // Si orderId est spécifié, filtrez pour cette commande spécifique
            if (orderId) {
                const specificOrder = orderDetails.find(order => order._id.toString() === orderId);
                if (specificOrder) {
                    orderProducts = specificOrder.products;
                }
            } else {
                // Si orderId n'est pas spécifié, récupérez tous les produits de toutes les commandes
                orderProducts = orderDetails.flatMap(order => order.products);
            }
        } else if (orderDetails && orderDetails._id.toString() === orderId) {
            orderProducts = orderDetails.products;
        }

        if (orderProducts.length === 0) {
            return res.status(404).json({ message: 'Produits de la commande non trouvés' });
        }

        res.status(200).json(orderProducts);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits de la commande:', error);
        if (error instanceof Error && error.message === 'Timeout en attendant la réponse') {
            res.status(504).json({ message: 'Timeout: Le service n\'a pas répondu dans le temps imparti', error: error.message });
        } else {
            res.status(500).json({ message: 'Erreur serveur', error: error instanceof Error ? error.message : String(error) });
        }
    }
};
