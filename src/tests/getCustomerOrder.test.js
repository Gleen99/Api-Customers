import { fetchOrderDetails } from '../consumers/orderService';
import Customer from '../models/orders/CustomersModels';
import { getCustomerOrder } from './getCustomersOrder';

jest.mock('../models/orders/CustomersModels');
jest.mock('../consumers/orderService');

describe('getCustomerOrder', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { customerId: 'testCustomerId', orderId: 'testOrderId' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 404 if customer is not found', async () => {
        Customer.findById.mockResolvedValue(null);

        await getCustomerOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Client non trouvé' });
    });

    it('should return 404 if order is not found', async () => {
        Customer.findById.mockResolvedValue({ _id: 'testCustomerId' });
        fetchOrderDetails.mockResolvedValue(null);

        await getCustomerOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Commande non trouvée' });
    });

    it('should return order details if customer and order are found', async () => {
        const orderDetails = { orderId: 'testOrderId' };
        Customer.findById.mockResolvedValue({ _id: 'testCustomerId' });
        fetchOrderDetails.mockResolvedValue(orderDetails);

        await getCustomerOrder(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('testCustomerId');
        expect(fetchOrderDetails).toHaveBeenCalledWith('testCustomerId', 'testOrderId');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(orderDetails);
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.findById.mockRejectedValue(error);

        await getCustomerOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur', error: 'Test Error' });
    });
});
