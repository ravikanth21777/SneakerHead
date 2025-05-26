const mongoose  =   require("mongoose")  ;

const userSchema  = mongoose.Schema(
    {
        username:{
            type:String,
            require:[true,'please add some username']
        },
        email:{
            type:String,
            require:[true,'please add some email'],
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

    },
    {
        timestamps:true 
    }
)

module.exports = mongoose.model('User', userSchema) ;