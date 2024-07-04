import { rabbitMQClient } from "../../rabbitmq";
import { Types } from "mongoose";

export const fetchOrderDetails = async (customerId: string, orderId?: string, productId?: string): Promise<any> => {
    const correlationId = new Types.ObjectId().toString();
    const responseQueue = `order_details_response_${correlationId}`;

    return new Promise<any>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.error('Timeout en attendant la réponse de RabbitMQ');
            rabbitMQClient.removeListener(responseQueue);
            reject(new Error('Timeout en attendant la réponse'));
        }, 60000);

        console.log(`Envoi de la requête pour les commandes du client ${customerId} sur la queue 'get_order_details'`);
        rabbitMQClient.publishMessage('get_order_details', JSON.stringify({
            customerId,
            orderId,
            productId,
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
    });
};
