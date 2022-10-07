var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectId = require('mongodb').ObjectId


module.exports = {
//---------------------------------------------------------------------------------------------------

    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            userData.Active = true
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.insertedId)
            })
        })

    },

//----------------------------------------------------------------------------------------------------
    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status && user.Active) {

                        response.user = user;
                        response.status = true;
                        resolve(response)
                    }
                    else {

                        resolve({ status: false })
                    }

                })
            } else {

                resolve({ status: false })

            }
        })
    },
//------------------------------------------------------------------------------------------------------

getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
            resolve(allProducts)
        } catch (error) {
            reject(error)
        }
    })
},


//-----------------------------------------------------------------------------------------------------------

getAllCat:()=>{
    return new Promise(async(resolve, reject) => {
        try {
            let allCategory= await db.get().collection(collections.CATEGORY_COLLECTION).find({}, {_id:0}).toArray()
            resolve(allCategory)
        } catch (error) {
            reject(error)
        }
    })
},

//------------------------------------------------------------------------------------------------------
getAllProductsCat: (category) => {
    return new Promise(async (resolve, reject) => {
        let allCatProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({ Categories: category }).toArray()

        resolve(allCatProducts)
    })
},

//------------------------------------------------------------------------------------------------------
proDetails: (proId) => {
     return new Promise(async (resolve, reject) => {
        productDetails = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
        resolve(productDetails)
    })
},
//------------------------------------------------------------------------------------------------------


addToCart: (proId, userId) => {
    let proObj = {
        item: objectId(proId),
        quantity: 1
    }
    return new Promise(async (resolve, reject) => {
        let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
        if (userCart) {
            let proExist = userCart.products.findIndex(product => product.item == proId)
            console.log(proExist);
            if (proExist != -1) {
                db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                    { $inc: { 'products.$.quantity': 1 } }).then(() => {
                        resolve()
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { products: proObj }
                    })
            }
        } else {
            let cartObj = {
                user: objectId(userId),
                products: [proObj]
                // products: [objectId(proId)]
            }
            db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                resolve()
            })
        }
    })
},

//-----------------------------------------------------------------------------------------------------------------



getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products' //products array  in the cart// 
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },


                /////////////////////////to get product wise total/////////////////////
                {
                    $project: {
                        item: '$item',
                        quantity: '$quantity',
                        product: '$product',
                        proTotal: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                    }

                }

                // {
                //     $lookup: {
                //         from: collections.PRODUCT_COLLECTION,
                //         let: { proList: '$products' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', "$$proList"]
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //     }
                // }
            ]).toArray()
            console.log(cartItems, "cartitems");
            resolve(cartItems)

        } catch (error) {
            reject(error)
        }
    })
},


//-------------------------------------------------------------------------------------------------------------

getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
        count = 0
        let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
        if (cart) {
            count = cart.products.length
        }
        console.log(count);
        resolve(count)
    })
},

//-------------------------------------------------------------------------------------------------------------

delCartPro: (details) => {
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collections.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                        resolve(response)
                    })
        } catch (error) {
            reject(error)
        }
    })
},

// -----------------------------------------------------------------------------------------------------------------------

getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

                    }
                },

                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                    }
                }



            ]).toArray()
            console.log(total[0], total[0].total, 'jerrry');
            resolve(total[0])

        } catch (error) {
            reject(error)
        }
    })
},

}