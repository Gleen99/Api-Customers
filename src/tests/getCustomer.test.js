import { isValidObjectId } from 'mongoose';
import { rabbitMQClient } from '../../rabbitmq';
import Customer from '../models/orders/CustomersModels';
import { getCustomer } from './getCustomers';

jest.mock('../models/orders/CustomersModels');
jest.mock('../../rabbitmq');
jest.mock('mongoose', () => ({
    isValidObjectId: jest.fn(),
}));

describe('getCustomer', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'testid' },
            ip: '127.0.0.1',
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        isValidObjectId.mockReturnValue(true);
    });

    it('should return 400 if id is invalid', async () => {
        isValidObjectId.mockReturnValue(false);

        await getCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'ID du customer invalide' });
    });

    it('should return a customer and publish a message', async () => {
        const customer = { _id: 'testid' };
        Customer.findById.mockResolvedValue(customer);
        rabbitMQClient.publishMessage.mockResolvedValue();

        await getCustomer(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('testid');
        expect(rabbitMQClient.publishMessage).toHaveBeenCalledWith('customer_consulte', JSON.stringify({
            id: 'testid',
            timestamp: expect.any(Date),
            userIp: '127.0.0.1',
        }));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(customer);
    });

    it('should handle customer not found', async () => {
        Customer.findById.mockResolvedValue(null);

        await getCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Customer non trouvé' });
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.findById.mockRejectedValue(error);

        await getCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' });
    });
});
