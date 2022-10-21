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


getCartProductList: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
        try {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart);
            resolve(cart.products)
        } catch (error) {
            reject(error)
        }
    })

},

placeOrder: (order, products, couponName, total) => {
    return new Promise(async (resolve, reject) => {
        try {
            let status = order['Payment-method'] === 'COD' ? 'placed' : 'pending'
            let Total = parseInt(order.Total)
            let orderObj = {
                deliveryDetails: {
                    Mobile: order.Phone,
                    Pincode: order.Pincode,
                    State: order.State,
                    District: order.District,
                    StreetName: order.Street_Name,
                    BuidlingName: order.Buidling_Name

                },
                userId: objectId(order.userId),
                Paymentmethod: order['Payment-method'],
                products: products,
                totalAmount: order.total,
                status: status
                }
            let users = [objectId(order.userId)]
           
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(response.insertedId)
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }

    })
},


//---------------------------------------------------------------------------------------------------------------------------
postProTotal: async (userId, proId) => {
    console.log(proId, 'proId');
    return new Promise(async (resolve, reject) => {
        try {
            let proTotal = await db.get().collection(collections.CART_COLLECTION).aggregate([

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

                    $unwind:
                        '$product'

                },

                
                {
                    $match: { "product._id": objectId(proId) }
                },

                {
                    $project: {
                        _id: 0,
                        proTotall: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                    }
                }

            ]).toArray()
            console.log(proTotal[0], "proTotal user-help");
            resolve(proTotal[0])
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
            console.log(total[0], total[0].total);
            resolve(total[0])

        } catch (error) {
            reject(error)
        }
    })
},

//---------------------------------------------------------------------------------------------------------

changeProductQuantity: (details) => {
    details.count = parseInt(details.count)

    details.quantity = parseInt(details.quantity)

    return new Promise(async (resolve, reject) => {
        try {
            if (details.count == -1 && details.quantity == 1) {
                console.log('hiii');
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                            resolve({ removeProduct: true })
                        })

            }
            else {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {

                            resolve({ status: true })
                        })
            }
        } catch (error) {
            reject(error)
        }
    })
},

//------------------------------------------------------------------------------------------------------------

addToWishlist: (proId, userId) => {
    let proObj = {
        item: objectId(proId),

    }
    return new Promise(async (resolve, reject) => {
        let userWishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (userWishlist) {
            let proExist = userWishlist.products.findIndex(product => product.item == proId)
            console.log(proExist);
            if (proExist != -1) {
                resolve({ status: "already exist" })
            } else {
                db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { products: proObj }
                    })
            }
        } else {
            let wishlistObj = {
                user: objectId(userId),
                products: [proObj]
                // products: [objectId(proId)]
            }
            db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                resolve()
            })
        }
    })
},


getWishlistCount: (userId) => {
    return new Promise(async (resolve, reject) => {
        count = 0
        let wishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (wishlist) {
            count = wishlist.products.length
        }
        resolve(count)
    })
},

getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        let wishlistProducts = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item'
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
                $unwind: '$product'


            }
        ]).toArray()
        console.log(wishlistProducts)
        resolve(wishlistProducts)
    })
},


delWishlistPro: (details) => {
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collections.WISHLIST_COLLECTION)
                .updateOne({ _id: objectId(details.wishlist) },
                    { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                        resolve(response)
                    })
        } catch (error) {
            reject(error)
        }
    })
},

//--------------------------------------------------------------------------------------------------

postAddAddress: (userId, address) => {
    create_random_id(15)
    function create_random_id(string_length) {
        var randomString = '';
        var numbers = '123456789'
        for (var i = 0; i < string_length; i++) {
            randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
        }
        address.addId = "add" + randomString
    }

    let addressObj = {
        addId: address.addId,
        name: address.name,
        phone: address.phone,
        building_Name: address.building_Name,
        street_name: address.street_name,
        city: address.city,
        district: address.district,
        state: address.state,
        pincode: address.pincode
    }

    return new Promise(async (resolve, reject) => {
        try {
            let userDetail = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
            console.log(userDetail.address, "lll");
            if (userDetail.address) {

                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                    {
                        $push: { address: addressObj }
                    })
            } else {
                let address = [addressObj]
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { address: address } })
                resolve()
                console.log(address, 'endddddddddddddddddd')
            }

        } catch (error) {
            reject(error)
        }

    })
},






    postChangePassword: (newPassword, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10)

                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { password: hashedNewPassword } })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },

    postEditProfile: (userId, editedUserDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({
                    _id: objectId(userId)
                }, {
                    $set: {
                        username: editedUserDetails.name
                    }
                }).then(() => {
                    resolve()
                }).catch((error) => {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },


    
    postDeleteAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                    { $pull: { address: { addId: addressId } } })
                    .then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }

        })
    },


    postEditAddress: (editedAddress) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(editedAddress.userId), 'address.addId': editedAddress.addressId },
                    {
                        $set: {
                            "address.$.name": editedAddress.name,
                            "address.$.phone": editedAddress.phone,
                            "address.$.building_Name": editedAddress.building_Name,
                            "address.$.street_name": editedAddress.street_name,
                            "address.$.city": editedAddress.city,
                            "address.$.district": editedAddress.district,
                            "address.$.state": editedAddress.state,
                            "address.$.pincode": editedAddress.pincode
                        }
                    }).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject(error)
                    })

            } catch (error) {
                reject(error)
            }

        })

    },


    postCurrentAddress: (userId, addressId) => {
        return new Promise(async (resolve, response) => {
            try {
                let currentAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    { $match: { _id: objectId(userId) } },
                    { $unwind: '$address' },
                    { $match: { 'address.addId': addressId } }
                ]).toArray()
                resolve(currentAddress[0].address)
            } catch (error) {
                reject(error)
            }
        })
    },


    getDeliveryAddress: (userId, addressId) => {
        return new Promise(async (resolve, response) => {
            try {
                let currentAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    { $match: { _id: objectId(userId) } },
                    { $unwind: '$address' },
                    { $match: { 'address.addId': addressId } }

                ]).toArray()
                resolve(currentAddress[0].address)
            } catch (error) {
                reject(error)
            }
        })
    },

//-------------------------------------------------------------------------------------------------
getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(orders)
        } catch (error) {
            reject(error)
        }
    })
}


}