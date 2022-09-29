var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
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
    }
}