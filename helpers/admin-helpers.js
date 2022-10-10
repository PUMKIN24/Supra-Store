var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const fs = require('fs');
const objectId = require('mongodb').ObjectId
const { resolve } = require('path');


module.exports = {

    doLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.name })

            if (admin) {
                if (admin.password === adminData.password) {
                    resolve({ status: true })

                }
                else {
                    resolve({ status: false })

                }
            } else {
                resolve({ status: false })
            }
        })
    },


    getAllUsers:()=>{
        return new Promise((resolve, reject) => {
            let allUsers=db.get().collection(collections.USER_COLLECTION).find({}).toArray()
            resolve(allUsers)
        })

    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: false } })
            resolve()
        })
    },

    unBlockUser:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: true } })
        })
    },
    


    insertProducts:(proDetails)=>{
        return new Promise((resolve,reject)=>{
db.get().collection(collections.PRODUCT_COLLECTION).insertOne(proDetails)
resolve()
        })

    },

    getCategory:()=>{
        return new Promise((resolve,reject)=>{
            let allCategories=db.get().collection(collections.CATEGORY_COLLECTION).find({}).toArray()
            resolve(allCategories)
        })
    },


    addCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(category)
        })
    },

    delCategory: (catId) => {
        db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })

    },




    getAllProducts:()=>{
    return new Promise(async(resolve, reject) => {
        let allProducts=await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
        resolve(allProducts)
    })
    },


    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let images = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }, { images: 1 })
            console.log(images, "imageeeeeeeeeeeeessss");
            images = images.images
            console.log(images.length);
            if (images.length > 0) {
                let imageNames = images.map((x) => {
                    x = `public/product-images/${x}`
                    return x
                })
                imageNames.forEach((element) => {
                    fs.existsSync(element) && fs.unlinkSync(element)
                });
            }
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) })

        })
    },
}