const client = require('twilio')('AC403313cabe938a233e2f59593c9bc0b8', '9f6b06f9440cfde86fe51a1c2346e909');
const serviceSid = 'VA045667c94f0095e569693cd0c02f1ad3'

module.exports = {

    doSms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verifications.create({
                to: `+91${userData.phone}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
                console.log(res);
            })
        })
    },

    otpVerify: (otpData, userData) => {
        let resp = {}

        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userData.phone}`,
                code: otpData.otp
            }).then((resp) => {
                console.log("verification success");
                resolve(resp)
            })
        })
    }



}