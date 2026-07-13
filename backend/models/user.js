//schema
const mongoose = require("mongoose")

const validator = require("validator")

const bcryptjs =require("bcryptjs")

const jwt = require("jsonwebtoken")

const crypto = require("crypto")


//create schema

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"please enter your name"],
        maxlength:[30,"Name cannot exceed 30 characters"]
    },
    email:{
        type: String,
        required:[true,"please enter email id"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"Enter valid email"]
    },
    password:{
        type: String,
        required:[true,"Enter password"],
        minlength:6,
        select:false
    },
    passwordConfirm:{
        type: String,
        required:[true,"Confirm password"],
        validate:{
            validator: function(el){
                return el === this.password
            },
            message:"Passwords mismatch"
        }
    },
    phoneNumber:{
        type: String,
        required:true,
        match: [/^[0-9]{10}$/,"Enter valid phone number"]
    },
    role:{
        type: String,
        enum:["user","admin"],
        default:"user"
    },
    avatar:{
        public_id: String,
        url: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
},
{
    timestamps: true
}
);

//hash password
//pre("save")=>runs before data is saved
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;

    this.password= await bcryptjs.hash(this.password,12)
    this.passwordConfirm = undefined
})

//password compare

userSchema.methods.correctPassword = async function(
    candidatePassword, userPassword 
){
    return await bcryptjs.compare(candidatePassword,userPassword)
}

//checks whether the user password was changed aftre getting jwt token
//if yes the token is invalid the user must login again
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    return false;
  };

//custom method to generate jwt token
userSchema.methods.getJWTToken = function(){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES}
    )
}

// PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {

  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User",userSchema)
