const mongoose  = require('mongoose');

const orderSchema = new mongoose.Schema({

  userId:{
    type:String,
    required:true
  },
  orderId:{
    type:String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  date:{
    type:Date,
    default:Date.now()
  },
  items:{
    type:Array,
    default:[]
  },
  paymentStatus:{
    type:String,
    default:""
  },
  subtotal:{
    type:Number,
    required:true
  },
  orderStatus:{
    type:String,
    default:"order placed"
  },
  orderCount:{
    type:Number,
    required:true
  }
});

module.exports  = mongoose.model('Order',orderSchema);