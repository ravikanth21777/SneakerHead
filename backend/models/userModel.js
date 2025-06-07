const mongoose  =   require("mongoose")  ;

const userSchema  = mongoose.Schema(
    {
        username:{
            type:String,
            require:[true,'please add some username'],
            unique:true
        },
        email:{
            type:String,
            require:[true,'please add some email'],
            unique:true
        },
        phone:{
            type:String,
            require:[true,'please add some phone number'],
            unique:true
        },
        password:{
            type:String,
            require:[true,'please add some password']
        },
        productsSold:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }],
        productsBought:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }],
        profilePictureUrl:{
            type:String,
            default : '' ,
        },
        
    },
    {
        timestamps:true 
    }
)

module.exports = mongoose.model('User', userSchema) ;