import express from 'express';
import { getCustomers } from '../controllers/getCustomers';
import { getCustomer } from '../controllers/getCustomer';
import { updateCustomer } from '../controllers/updateCustomer';
import { deleteCustomer } from '../controllers/deleteCustomer';
import { createCustomer } from "../controllers/createCustomer";
import { getCustomerOrders } from "../controllers/getCustomerOrders";
import { getCustomerOrder } from "../controllers/getCustomerOrder";
import { getCustomerOrderProducts } from "../controllers/getCustomerOrderProducts";
import { getCustomerOrderProduct } from "../controllers/getCustomerOrderProduct";

const router = express.Router();


router.get('/', getCustomers);

router.get('/:id', getCustomer);

router.post('/', createCustomer);

router.put('/:id', updateCustomer);

router.delete('/:id', deleteCustomer);

router.get('/:customerId/orders', getCustomerOrders);

router.get('/:customerId/orders/:orderId', getCustomerOrder);

router.get('/:customerId/orders/:orderId/products', getCustomerOrderProducts);

router.get('/:customerId/orders/:orderId/products/:productId', getCustomerOrderProduct);

export default router;
