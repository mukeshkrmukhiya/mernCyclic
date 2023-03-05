const express = require('express')
const router = express.Router()
require("../db/conn")
const User = require("../models/userSchema")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Authenticate = require('../middleware/Authenticate')
const cookieParser = require('cookie-parser')
router.use(cookieParser());

router.get('/', (req, res) => {
    res.send("Hello from router side")
    console.log("hello in ruter /")
})

router.post("/register", async (req, res) => {
    const { name , email, phone, work, password, cpassword } = req.body;


    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ message: "please fill all parameters" })
    }

    
    // promises
    // User.findOne({email: email}).then((userExist)=>{
    //     if(userExist){
    //     return res.status(202).json({error: "email already exist"})}

    //         const user = new User({name, email, phone, work, password, cpassword})
    //         user.save().then(()=> res.status(201).json({message: "Resitration succesfull"})).catch((err)=> {res.status(500).json({error: "Registration failed"})})


    // }).catch((err)=>{
    //     console.log(err)
    // })

    // async await

    try {
        const userExist = await User.findOne({ email: email })
        if (userExist) {
            return res.status(202).json({ error: "email already exist" })
        } else if (password != cpassword) {
            return res.status(202).json({ error: "pasword not matched" })

        }

        // it is same as
        //  const user = new User({name : name, email :email, phone : phone, work: work, password: password, cpassword: cpassword})

        const user = new User({ name, email, phone, work, password, cpassword })

        const userResgiter = await user.save()

        if (userResgiter) {
            res.status(201).json({ message: "Resitration succesfull" })
        } else {
            res.status(500).json({ error: "Registration failed" })
        }

    } catch (error) {
        console.log(error)
    }

})



router.post('/signin', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "plese fill all parameters" })
        }


        const userLogin = await User.findOne({ email })

        if (!userLogin) {
            return res.status(400).json({ error: " user not exits" })
        } else {

            const isMatch = await bcrypt.compare(password, userLogin.password)
            
            if (isMatch) {
                const token = await userLogin.generateAuthToken();
                res.cookie("LoginCookies", token, {
                    expires: new Date(Date.now()+ 1245785980), 
                    httpOnly: true
                    
                })

                res.status(200).json({ message: "signin successful" })
            } else {
                res.status(400).json({ error: "password not match" })

            }
        }

    } catch (error) {
        console.log(error)
    }




})


// aboutUs page

router.get('/about',Authenticate, (req, res)=>{
    
    console.log("hello from about1")
    res.send(req.rootUser)
})


router.get('/getdata',Authenticate, (req, res)=>{
    console.log("hello from get data")
    res.send(req.rootUser)

})

//Concat
router.post('/contact', Authenticate, async (req, res) => {
    try {
     
  
      const { name, email, subject, message } = req.body;
  
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Please fill form properly" });
      }
  
      const userContact = await User.findOne({ _id: req.userId });
  
      if (userContact) {
        const userMessage = await userContact.addMessage(name, email, subject, message);
       
        res.status(201).json({ message: 'Message created successfully' });
      } else {
        res.status(401).json({ error: 'Message not created' });
      }
  
    } catch (error) {
      console.log("Contact page error");
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  router.get('/logout', (req, res)=>{
    console.log("hello from get Logout")
    res.clearCookie("LoginCookies",{path : '/'})
    res.status(200).send("log out successful")

})
  


module.exports = router;