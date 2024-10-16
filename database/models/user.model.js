import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures the username is unique
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures the email is unique
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Enforces password length
  },
  mobile:{
    type:String,
    require:true,
  },
  otp:{
    type:String,
    require:false,
    default:'0000'
  }
},
{
  timestamps:true
});

export const User = mongoose.model('User', userSchema);