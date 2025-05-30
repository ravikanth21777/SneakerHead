const mongoose  =   require("mongoose")  ;

const productSchema  = mongoose.Schema(
    {
        name:{
            type:String,
            require:[true,'please add some name']
        },
        description:{
            type:String,
            require:[true,'please add some description']
        },
        brand:{
            type:String,
            require:[true,'please add some brand'],
        },
        edition:{
            type:String,
            require:[true,'please add some edition'],
        },
        size:{
            type:String,
            require:[true,'please add some size'],
        },
        category:{
            type:String,
            require:[true,'please add some size'],
            enum:['Sneakers', 'Limited Edition', 'Collaboration', 'Vintage', 'Custom'], 
        },
        startBid:{
            type:Number,
            require:[true,'please add some starting bid'],
        },
        AuctionEndDate:{
            type:date,
            require:[true,'please add some date and time'],
        },
        bidIncrement:{
            type:Number,
            require:[false,'please add some minimum increment'],
        },
        buyNowPrice:{
            type:Number,
            require:[false,'please add some buy now price'],
        },
        seller:{
            type:mongoose.Schema.Types.ObjectId,
            require:[true,'please add some seller'],
            ref:'User'
        },
        buyer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            default:null
        }

    },
    {
        timestamps:true 
    }
)

module.exports = mongoose.model('Product', productSchema) ;