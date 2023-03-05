const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')



const userSchema = mongoose.Schema({
    name: {
        
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    work: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    messages:[
        {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            subject: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
    tokens:
        [{

            token: {
                type: String,
                required: true
            }
        }
        ]

})

userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
        this.cpassword = await bcrypt.hash(this.cpassword, 12)
    }
    next()
})

// generatin jwt

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        this.save()
        return token
    } catch (error) {
        console.log(error);
    }
}


//store the message

userSchema.methods.addMessage = async function (name , email ,  subject , message){
    try {
        this.messages = this.messages.concat({name , email ,  subject , message})
        await this.save()
        return this.messages;
    } catch (error) {
        console.log('add userSchema error');
        console.log(error);
    }
}

// collection 
const User = mongoose.model('user', userSchema)

module.exports = User