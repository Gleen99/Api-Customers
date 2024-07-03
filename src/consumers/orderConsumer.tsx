import { rabbitMQClient } from "../../rabbitmq";
import Customer from "../models/orders/CustomersModels";
import mongoose from 'mongoose';

export const initOrderConsumer = () => {
    rabbitMQClient.consumeMessage('order_created', async (message) => {
        if (message === null) {
            console.log('Received null message, ignoring.');
            return;
        }

        try {
            const orderData = JSON.parse(message.content.toString());

            const order = await Customer.findByIdAndUpdate(
                orderData.customerId,
                {
                    $push: {
                        orders: {
                            _id: new mongoose.Types.ObjectId(orderData.orderId),
                            createdAt: new Date(orderData.createdAt),
                            customerId: new mongoose.Types.ObjectId(orderData.customerId)
                        }
                    }
                },
                { new: true }
            );
            console.log(`Commande ${orderData._id} ajoutée au client ${orderData.customerId}`);

            // Use ackMessage instead of acknowledgeMessage
            await rabbitMQClient.ackMessage(message);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du client avec la nouvelle commande:', error);
            // If there's an error, you might want to nack the message
            await rabbitMQClient.nackMessage(message);
        }
    });
}
