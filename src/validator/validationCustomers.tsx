import Joi from 'joi';

export const customerSchema = Joi.object({
    name: Joi.string().required().max(100),
    username: Joi.string().required().max(50),
    firstName: Joi.string().required().max(50),
    lastName: Joi.string().required().max(50),
    address: Joi.object({
        postalCode: Joi.string().required().max(10),
        city: Joi.string().required().max(100)
    }).required(),
    profile: Joi.object({
        firstName: Joi.string().required().max(50),
        lastName: Joi.string().required().max(50)
    }).required(),
    company: Joi.object({
        companyName: Joi.string().required().max(100)
    }).required(),
    orders: Joi.array().items(Joi.object({
        _id: Joi.string().required(),
        createdAt: Joi.date(),
        customerId: Joi.string().required(),
        products: Joi.array().items(Joi.object({
            createdAt: Joi.date(),
            name: Joi.string().required().max(100),
            details: Joi.object({
                price: Joi.string().required(),
                description: Joi.string().required().max(500),
                color: Joi.string().required()
            }).required(),
            stock: Joi.number().min(0).required(),
            _id: Joi.string().required(),
            orderId: Joi.string().required()
        }))
    }))
});

export const validateCustomer = (customer: any) => {
    return customerSchema.validate(customer, { abortEarly: false });
};
