import { fetchOrderDetails } from '../consumers/orderService';
import { getCustomerOrders } from '../controllers/getCustomerOrders';
import Customer from '../models/orders/CustomersModels';

jest.mock('../models/orders/CustomersModels');
jest.mock('../consumers/orderService');

describe('getCustomerOrders', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { customerId: 'testCustomerId' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 404 if customer is not found', async () => {
        Customer.findById.mockResolvedValue(null);

        await getCustomerOrders(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Client non trouvé' });
    });

    it('should return orders if customer is found', async () => {
        const orders = [{ id: 'order1' }, { id: 'order2' }];
        Customer.findById.mockResolvedValue({ _id: 'testCustomerId' });
        fetchOrderDetails.mockResolvedValue(orders);

        await getCustomerOrders(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('testCustomerId');
        expect(fetchOrderDetails).toHaveBeenCalledWith('testCustomerId');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(orders);
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.findById.mockRejectedValue(error);

        await getCustomerOrders(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur', error: 'Test Error' });
    });
});
