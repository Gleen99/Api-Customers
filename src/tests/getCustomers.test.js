import { rabbitMQClient } from '../../rabbitmq';
import { getCustomers } from '../controllers/getCustomers';
import Customer from '../models/orders/CustomersModels';

jest.mock('../models/orders/CustomersModels');
jest.mock('../../rabbitmq');

describe('getCustomers', () => {
    let req, res;

    beforeEach(() => {
        req = {
            ip: '127.0.0.1',
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 404 if no customers are found', async () => {
        Customer.find.mockResolvedValue([]);

        await getCustomers(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Aucun Client trouvé' });
    });

    it('should return customers and publish a message', async () => {
        const customers = [{ id: 'customer1' }, { id: 'customer2' }];
        Customer.find.mockResolvedValue(customers);
        rabbitMQClient.publishMessage.mockResolvedValue();

        await getCustomers(req, res);

        expect(Customer.find).toHaveBeenCalled();
        expect(rabbitMQClient.publishMessage).toHaveBeenCalledWith('liste_customer_consultee', expect.any(String));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(customers);
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.find.mockRejectedValue(error);

        await getCustomers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' });
    });
});
