import { rabbitMQClient } from "../../rabbitmq";
import { Types } from "mongoose";

export const fetchOrderDetails = async (customerId: string, orderId?: string, productId?: string): Promise<any> => {
    const correlationId = new Types.ObjectId().toString();
    const responseQueue = `order_details_response_${correlationId}`;

    return new Promise<any>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        const setupConsumerAndSendRequest = async () => {
            try {
                // Configurer le consommateur avant d'envoyer la requête
                await rabbitMQClient.consumeMessage(responseQueue, async (msg) => {
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

                // Envoyer la requête après avoir configuré le consommateur
                console.log(`Envoi de la requête pour les commandes du client ${customerId}`);
                await rabbitMQClient.publishMessage('get_order_details', JSON.stringify({
                    customerId,
                    orderId,
                    productId,
                    correlationId,
                    responseQueue
                }));

                // Configurer le timeout après avoir envoyé la requête
                timeoutId = setTimeout(() => {
                    console.error('Timeout en attendant la réponse de RabbitMQ');
                    rabbitMQClient.removeListener(responseQueue);
                    reject(new Error('Timeout en attendant la réponse'));
                }, 60000);

            } catch (error) {
                console.error('Erreur lors de la configuration du consommateur ou de l\'envoi de la requête:', error);
                reject(error);
            }
        };

        setupConsumerAndSendRequest();
    });
};
