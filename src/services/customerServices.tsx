import { rabbitMQClient } from "../../rabbitmq";
import Customer from "../models/orders/CustomersModels";
import { Types } from "mongoose";

export async function initGetCustomerOrdersConsumer() {
    await rabbitMQClient.consumeMessage('get_products_details', async (msg) => {
        if (!msg) return;
        const content = JSON.parse(msg.content.toString());
        const { customerId, correlationId, responseQueue } = content;
        try {
            console.log(`Récupération des commandes pour le client: ${customerId}`);
            const customer = await Customer.findById(customerId).populate('orders');
            const orders = customer ? customer.orders : [];
            console.log('Envoi de la réponse avec les détails des orders');
            await rabbitMQClient.publishMessage(responseQueue, JSON.stringify(orders), { correlationId });
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            await rabbitMQClient.publishMessage(responseQueue, JSON.stringify({ error: 'Erreur lors de la récupération des commandes' }), { correlationId });
        } finally {
            await rabbitMQClient.ackMessage(msg);
        }
    });
    console.log('Consommateur pour get_customer_produits configuré avec succès');
}
export async function initGetCustomerProductsConsumer() {
    await rabbitMQClient.consumeMessage('get_customer_produits', async (msg) => {
        if (!msg) return;
        const content = JSON.parse(msg.content.toString());
        const { customerId, correlationId, responseQueue } = content;
        try {
            console.log(`Récupération des commandes pour le client: ${customerId}`);
            const customer = await Customer.findById(customerId).populate('orders');
            const orders = customer ? customer.orders : [];
            console.log('Envoi de la réponse avec les détails des orders');
            await rabbitMQClient.publishMessage(responseQueue, JSON.stringify(orders), { correlationId });
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            await rabbitMQClient.publishMessage(responseQueue, JSON.stringify({ error: 'Erreur lors de la récupération des commandes' }), { correlationId });
        } finally {
            await rabbitMQClient.ackMessage(msg);
        }
    });
    console.log('Consommateur pour get_customer_produits configuré avec succès');
}

export const initOrderConsumer = () => {
    rabbitMQClient.consumeMessage('order_created', async (message) => {
        if (!message) return;

        try {
            const orderData = JSON.parse(message.content.toString());

            await Customer.findByIdAndUpdate(
                orderData.customerId,
                {
                    $push: {
                        orders: {
                            _id: new Types.ObjectId(orderData.orderId),
                            createdAt: new Date(orderData.createdAt),
                            customerId: new Types.ObjectId(orderData.customerId)
                        }
                    }
                }
            );
            console.log(`Commande ${orderData.orderId} ajoutée au client ${orderData.customerId}`);
            await rabbitMQClient.ackMessage(message);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du client avec la nouvelle commande:', error);
            await rabbitMQClient.nackMessage(message);
        }
    });
}

export const fetchOrderDetails = async (customerId: string, orderId?: string): Promise<any> => {
    const correlationId = new Types.ObjectId().toString();
    const responseQueue = `get_customer_orders_response_${correlationId}`;

    return new Promise<any>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.error('Timeout en attendant la réponse de RabbitMQ');
            rabbitMQClient.removeListener(responseQueue);
            reject(new Error('Timeout en attendant la réponse'));
        }, 60000);

        rabbitMQClient.consumeMessage(responseQueue, async (msg) => {
            clearTimeout(timeoutId);
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                resolve(content);
                await rabbitMQClient.ackMessage(msg);
                rabbitMQClient.removeListener(responseQueue);
            } else {
                reject(new Error('Aucune réponse reçue'));
            }
        });

        rabbitMQClient.publishMessage('get_customer_orders', JSON.stringify({
            customerId,
            orderId,
            correlationId,
            responseQueue
        }));
    });
};

export async function setupCustomerService() {
    try {
        await rabbitMQClient.connect();
        await rabbitMQClient.setup();
        initGetCustomerOrdersConsumer();
        initGetCustomerProductsConsumer()
        initOrderConsumer();
        console.log('Service des clients configuré avec succès');
    } catch (error) {
        console.error('Erreur lors de la configuration du service des clients:', error);
        throw error;
    }
}
