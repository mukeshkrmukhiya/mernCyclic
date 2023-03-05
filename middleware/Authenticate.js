const jwt = require('jsonwebtoken');
// const { Mongoose } = require('mongoose');
const User = require('../models/userSchema')



const Authenticate = async  (req, res, next)=>{
    try {
        // console.log("token : " + process.env.SECRET_KEY)

        const token = req.cookies.LoginCookies;
        // console.log("token preload: " + token)

        // if(typeof token !== "undefined"){}else{
        //     return  res.status(401).send('unothorized: Not token proveded')}

        const veryfytoken = jwt.verify(token, process.env.SECRET_KEY)
        // console.log('after' + veryfytoken)
        const rootUser = await User.findOne({_id: veryfytoken._id, 'tokens.token': token })
        // console.log("rootUser"+ rootUser);
        


        if(!rootUser){
            throw new Error("user not found")
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        next();
        
    } catch (error) {
        res.status(401).send('unauthorized: Not token proveded')
        console.log(error);
        // throw new Error(res.error)
    }
}

module.exports = Authenticate;