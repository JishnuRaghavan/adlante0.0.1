const mongoose  = require('mongoose');


const subcategorySchema = new mongoose.Schema({
  subcategory:{
    type:String,
    required:true
  }
})

const categorySchema  = new mongoose.Schema({

  maincategory:{
    type:String,
    required:true,
  },
  subcategory:[subcategorySchema]

});

module.exports  = mongoose.model('Category',categorySchema);
