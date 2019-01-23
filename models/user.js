const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this);
    }

    addToCart(product) {
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });

        let newQuantity = 1;
        const updateCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updateCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updateCartItems.push({ 
                productId: new ObjectId(product._id),
                quantity: newQuantity
            });
        }

        const updatedCart = {
            items: updateCartItems
        };

        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                {$set: { cart: updatedCart }});
    }

    async getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => i.productId);

        const products = await db.collection('products')
            .find({ _id: {
                $in: productIds
            }})
            .toArray();
            
        return products.map(p => {
            return {
                ...p,
                quantity: this.cart.items
                    .find(i => i.productId.toString() === p._id.toString())
                    .quantity
            }
        });
    }

    deleteItemFromCart(productId) {
        const db = getDb();

        const updatedCartItems = this.cart.items.filter(i => i.productId.toString() !== productId.toString());

        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: { items: updatedCartItems} }});
    }

    async addOrder() {
        const db = getDb();
        try {
            const products = await this.getCart();

            const order = { 
                items: products,
                user: {
                    _id: new ObjectId(this._id),
                    name: this.name
                }
            }

            const newOrder = await db.collection('orders').insertOne(order);

            this.cart = { items: [] };

            const result = await db.collection('users')
                                    .updateOne(
                                        { _id: new ObjectId(this._id) },
                                        { $set: { cart: { items: [] } } }
                                    );
        } catch(e) {
            console.log(e);
        }
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find( { 'user._id': new ObjectId(this._id) } )
            .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: ObjectId(userId)});
    }
}

module.exports = User;