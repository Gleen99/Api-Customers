import mongoose, {Schema, Document, Model, ObjectId} from 'mongoose';

interface IProductDetails {
    price: string;
    description: string;
    color: string;
}

export interface IProduct {
    createdAt: Date;
    name: string;
    details: IProductDetails;
    stock: number;
    _id: ObjectId;
    orderId: ObjectId;
}

interface IOrder {
    createdAt: Date;
    _id: ObjectId;
    customerId: ObjectId;
    products?: IProduct[];
}

export interface ICustomer extends Document {
    _id: ObjectId;
    createdAt: Date;
    name: string;
    username: string;
    firstName: string;
    lastName: string;
    address: {
        postalCode: string;
        city: string;
    };
    profile: {
        firstName: string;
        lastName: string;
    };
    company: {
        companyName: string;
    };
    orders: IOrder[];
}

const productDetailsSchema = new Schema({
    price: { type: String, required: true },
    description: { type: String, required: true, maxlength: 500 },
    color: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema({
    createdAt: { type: Date, required: true, default: Date.now },
    name: { type: String, required: true, maxlength: 100 },
    details: { type: productDetailsSchema, required: true },
    stock: { type: Number, required: true, min: 0 },
    _id: { type: Schema.Types.ObjectId, required: true },
    orderId: { type: Schema.Types.ObjectId, required: true }
}, { _id: false });

const orderSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, index: true  },
    createdAt: { type: Date, required: true, default: Date.now },
    customerId: { type: Schema.Types.ObjectId, required: true, index: true },
    products: { type: [productSchema], default: undefined }
});


const CustomerSchema: Schema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50
    },
    firstName: {
        type: String,
        required: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50
    },
    address: {
        postalCode: {
            type: String,
            required: true,
            maxlength: 10
        },
        city: {
            type: String,
            required: true,
            maxlength: 100
        }
    },
    profile: {
        firstName: {
            type: String,
            required: true,
            maxlength: 50
        },
        lastName: {
            type: String,
            required: true,
            maxlength: 50
        }
    },
    company: {
        companyName: {
            type: String,
            required: true,
            maxlength: 100
        }
    },
    orders: [orderSchema]
}, {
    collection: 'customers',
    timestamps: false
});

CustomerSchema.index({ username: 1 }, { unique: true });

const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
