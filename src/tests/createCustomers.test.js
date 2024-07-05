import { rabbitMQClient } from '../../rabbitmq';
import Customer from '../models/orders/CustomersModels';
import { createCustomer } from './createCustomers';

jest.mock('../models/orders/CustomersModels');
jest.mock('../../rabbitmq');

describe('createCustomer', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'Test Name',
                username: 'testusername',
                firstName: 'Test',
                lastName: 'User',
                address: 'Test Address',
                profile: 'Test Profile',
                company: 'Test Company',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 400 if required fields are missing', async () => {
        req.body.name = '';

        await createCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tous les champs sont requis' });
    });

    it('should create a customer and publish a message', async () => {
        Customer.create.mockResolvedValue(req.body);
        rabbitMQClient.publishMessage.mockResolvedValue();

        await createCustomer(req, res);

        expect(Customer.create).toHaveBeenCalledWith(req.body);
        expect(rabbitMQClient.publishMessage).toHaveBeenCalledWith('customer_created', JSON.stringify(req.body));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.create.mockRejectedValue(error);

        await createCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur lors de la création du client', error });
    });
});
