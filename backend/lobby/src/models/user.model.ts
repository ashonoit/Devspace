import mongoose from "mongoose";

export interface IUser extends mongoose.Document{
  username: string,
  email: string,
  passHash?:string,
  loginVia:string
}

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passHash: {
      type: String,
    },
    googleId:{
      type: String
    },
    loginVia:{
      type: String,
      enum:['manual', 'google'],
      default:'manual'
    }

},{
    timestamps:true
});

const User= mongoose.model<IUser>('User', userSchema);
export default User;