import { rabbitMQClient } from "../../rabbitmq";
import Customer from "../models/orders/CustomersModels";
import amqp from "amqplib";

export async function initGetCustomerOrdersConsumer() {
    await rabbitMQClient.consumeMessage('products_details_response', async (msg: amqp.ConsumeMessage | null) => {
        if (!msg) return;
        const content = JSON.parse(msg.content.toString());
        const { customerId, correlationId } = content;
        try {
            console.log(`Récupération des commandes pour le client: ${customerId}`);
            const orders = await Customer.find({ customerId });
            console.log('Envoi de la réponse avec les détails des orders');
            console.log(`Envoi de la requête pour les commandes du client ${customerId} sur la queue 'get_products_details'`);
            await rabbitMQClient.publishMessage(
                'products_details_response',
                JSON.stringify(orders),
                { correlationId }
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            await rabbitMQClient.publishMessage(
                'products_details_response',
                JSON.stringify({ error: 'Erreur lors de la récupération des commandes' }),
                { correlationId }
            );
        } finally {
            rabbitMQClient.ackMessage(msg);
        }
    });
    console.log('Consommateur pour get_customer_produits configuré avec succès');
}
