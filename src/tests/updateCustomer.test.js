import { isValidObjectId } from 'mongoose';
import { rabbitMQClient } from '../../rabbitmq';
import { updateCustomer } from '../controllers/updateCustomer';
import Customer from '../models/orders/CustomersModels';

jest.mock('../models/orders/CustomersModels');
jest.mock('../../rabbitmq');
jest.mock('mongoose', () => ({
    isValidObjectId: jest.fn(),
}));

describe('updateCustomer', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'testid' },
            body: { name: 'Updated Name' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        isValidObjectId.mockReturnValue(true);
    });

    it('should return 400 if id is invalid', async () => {
        isValidObjectId.mockReturnValue(false);

        await updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'ID du customer invalide' });
    });

    it('should update the customer and publish a message', async () => {
        const updatedCustomer = { _id: 'testid', name: 'Updated Name' };
        Customer.findByIdAndUpdate.mockResolvedValue(updatedCustomer);
        rabbitMQClient.publishMessage.mockResolvedValue();

        await updateCustomer(req, res);

        expect(Customer.findByIdAndUpdate).toHaveBeenCalledWith('testid', req.body, { new: true, runValidators: true });
        expect(rabbitMQClient.publishMessage).toHaveBeenCalledWith('produit_mis_a_jour', JSON.stringify(updatedCustomer));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedCustomer);
    });

    it('should handle customer not found', async () => {
        Customer.findByIdAndUpdate.mockResolvedValue(null);

        await updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produit non trouvé' });
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.findByIdAndUpdate.mockRejectedValue(error);

        await updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' });
    });
});
