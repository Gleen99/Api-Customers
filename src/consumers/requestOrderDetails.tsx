import { Types } from 'mongoose';
import { rabbitMQClient } from "../../rabbitmq";

export const requestOrderDetails = async (customerId: string, orderId?: string): Promise<any> => {
    const correlationId = new Types.ObjectId().toString();
    const responseQueue = `products_details_response${correlationId}`;

    console.log(`CorrelationId généré: ${correlationId}`);

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.error('Timeout en attendant la réponse de RabbitMQ');
            rabbitMQClient.removeListener(responseQueue);
            reject(new Error('Timeout en attendant la réponse'));
        }, 60000);
        console.log(`Envoi de la requête pour les commandes du client ${customerId} sur la queue 'products_details_response'`);
        rabbitMQClient.publishMessage('products_details_response', JSON.stringify({
            customerId,
            orderId,
            correlationId,
            responseQueue
        }));
        rabbitMQClient.consumeMessage(responseQueue, async (msg) => {
            clearTimeout(timeoutId);
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                resolve(content);
                try {
                    await rabbitMQClient.ackMessage(msg);
                } catch (error) {
                    console.error('Erreur lors de l\'acquittement du message de réponse:', error);
                }
                rabbitMQClient.removeListener(responseQueue);
            } else {
                reject(new Error('Aucune réponse reçue'));
            }
        });


        rabbitMQClient.publishMessage('get_customer_produits', JSON.stringify({
            customerId,
            orderId,
            correlationId,
            responseQueue
        }));
    });
};

