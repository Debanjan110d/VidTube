import mongoose, { Schema } from "mongoose";//Declaring Schema from mongoosem so that do not have to create it again and again


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

export const User = mongoose.model("User", userSchema);
// So mongoose is saying that, hey, mongoose, I

// want to build a model, a new structure,

// a new document in my database.

// That document will be called as user and the schema that we have defined will be the structure of that document.