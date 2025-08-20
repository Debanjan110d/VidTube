import mongoose, { Schema } from "mongoose";//Declaring Schema from mongoosem so that do not have to create it again and again


const userSchema = new Schema(// Schema is a constructor function that is used to create a new schema for the user model
    // Now we are gonna write different objects
    {
        // username: String,
        // email:String,

        username: {
            type: String,
            required: true,
            unique: true
        }



    }
)

export const User = mongoose.model("User", userSchema);
// So mongoose is saying that, hey, mongoose, I

// want to build a model, a new structure,

// a new document in my database.

// That document will be called as user and the schema that we have defined will be the structure of that document.