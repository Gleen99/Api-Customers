import { fetchOrderDetails } from '../consumers/orderService';
import { getCustomerOrderProducts } from '../controllers/getCustomerOrderProducts';
import Customer from '../models/orders/CustomersModels';

jest.mock('../models/orders/CustomersModels');
jest.mock('../consumers/orderService');

describe('getCustomerOrderProducts', () => {
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

        await getCustomerOrderProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Client non trouvé' });
    });

    it('should return 404 if products are not found', async () => {
        Customer.findById.mockResolvedValue({ _id: 'testCustomerId' });
        fetchOrderDetails.mockResolvedValue(null);

        await getCustomerOrderProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produits de la commande non trouvés' });
    });

    it('should return products if found', async () => {
        const orderDetails = { _id: 'testOrderId', products: [{ id: 'testProductId' }] };
        Customer.findById.mockResolvedValue({ _id: 'testCustomerId' });
        fetchOrderDetails.mockResolvedValue(orderDetails);

        await getCustomerOrderProducts(req, res);

        expect(Customer.findById).toHaveBeenCalledWith('testCustomerId');
        expect(fetchOrderDetails).toHaveBeenCalledWith('testCustomerId', 'testOrderId');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(orderDetails.products);
    });

    it('should handle errors', async () => {
        const error = new Error('Test Error');
        Customer.findById.mockRejectedValue(error);

        await getCustomerOrderProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur', error: 'Test Error' });
    });
});
