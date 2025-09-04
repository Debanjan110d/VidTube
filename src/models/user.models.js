import mongoose, { Schema } from "mongoose";//Declaring Schema from mongoosem so that do not have to create it again and again
import bcrypt from "bcrypt";// bcrypt is a password hashing library that is used to securely store passwords in a database
import jwt from "jsonwebtoken";

const userSchema = new Schema(// Schema is a constructor function that is used to create a new schema for the user model
    // Now we are gonna write different objects
    {
        // username: String,
        // email:String,

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true

        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,

        }
        ,
        avatar: {
            type: String,//Cloudnary link
            required: true,


        },
        coverimage: {
            type: String,

        }
        ,
        /* The `watch_history` field in the user schema is defining an array of objects where each object
        contains a reference to a `Video` document in the database. */
        watch_history: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']

        },

        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true//The documents will automatically gets the createdAt and updatedAt fields
    }
)

//Pre-hook runs before saving the document
// One more thing thing :
// 100% time requires next.

// All these middlewares that you're writing, they

// need some next because request response.

// And the third parameter is the next.

// Next is the way to pass on your request from

// one middleware to the next middleware, to the next middleware,
// This is a prehook
userSchema.pre("save", async function (next) {// Never use arrow function here  because we need the context many times 


    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);//Hashing the password ,10 is the number of rounds of encription 



    next();// Next is the way to pass on your request from one middleware to the next middleware

})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    //short lived acess token 

    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    //long lived refresh token 

    return jwt.sign(
        {
            _id: this._id,

        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema);
// So mongoose is saying that, hey, mongoose, I

// want to build a model, a new structure,

// a new document in my database.

// That document will be called as user and the schema that we have defined will be the structure of that document.