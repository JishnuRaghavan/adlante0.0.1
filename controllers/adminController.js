const Admin = require('../models/adminModel');
const Product= require('../models/productModel');
const User  = require('../models/userModel');
const bcrypt= require('bcrypt');
const session = require('express-session');
const Category= require('../models/categoryModel');

const securePassword  = async(password)=>{

  try {
    
    const hashedPassword  = await bcrypt.hash(password,10);
    return hashedPassword;

  } catch (error) {
    console.log(error.message);
  }

}

const loadLogin = async(req,res)=>{

  try {
    
    res.render('signin',{message:''});

  } catch (error) {
    console.log(error.message);
  }

}

const verifyLogin = async(req,res)=>{

  try {
    
    const { name,password } = req.body;
    const adminData = await Admin.findOne({name:name});
    
    if(adminData){
      const passwordCheck = await bcrypt.compare(password,adminData.password);
      if(passwordCheck){
        req.session.admin_id = adminData._id;
        res.redirect('/admin/adminhome');
      }
      else{
        res.render('signin',{message:"invalid credentials"});
      }
    }
    else{
      res.render('signin',{message:"admin not found"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadDashboard = async(req,res)=>{

  try {
    
    res.render('adminhome');

  } catch (error) {
    console.log(error.message);
  }

}

const signout = async(req,res)=>{

  try {
    req.session.destroy();
    res.redirect('/admin/signin');

  } catch (error) {
    console.log(error.message);
  }

}

const ecommerceCustomer = async(req,res)=>{

  try {
    
    const users = await User.find();
    res.render('ecommerce-customer',{customeradd:"",users:users});
  } catch (error) {
    console.log(error.message);
  }

}

const addCustomer = async(req,res)=>{

  try {
    
    const { name,email,mobile,joinedDate }  = req.body;
    console.log(email);
    const UserData  = await User.findOne({email:email});
    if(UserData){
      res.render('ecommerce-customer',{customeradd:"user already exists"});
    }
    else{
      const user  = new User({
        name:name,
        email:email,
        mobile:mobile,
        password:"12345",
        is_verified:0,
        joinedDate:joinedDate
      })
      const userDataAdded = await user.save();
      if(userDataAdded){
        console.log(userDataAdded);
        res.redirect('/admin/ecommerce-customer');
      }
      else{
        res.render('ecommerce-customer',{customeradd:"failed"});
      }
    }

  } catch (error) {
    console.log(error.message);
  }
}

const blockUser  = async(req,res)=>{

  try {
    
    const { selectedEmails } = req.body;
    console.log(selectedEmails);

    const updated = await User.updateMany({email:{$in:selectedEmails}},{$set:{active:"blocked"}});
    console.log("data updated");
    res.render('ecommerce-customer',{customeradd:"user blocked"});

    

  } catch (error) {
    console.log(error.message);
  }

}

const unblockUser = async(req,res)=>{

  try {
    
    const{ selectedEmails } = req.body;

    const updated = await User.updateMany({email:{$in:selectedEmails}},{$set:{active:"active"}});

    res.render('ecommerce-customer',{customeradd:"user unblocked"});

  } catch (error) {
    console.log(error.message);
  }

}

const productEditLoad = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    const productData = await Product.find();
    res.render('productEdit',{products:productData,categories:categories});

  } catch (error) {
    console.log(error.message);
  }

}

const addProduct  = async(req,res)=>{

  try {
    
    console.log(req.body);
    const {title,description,brand,category,subcategory,gender,tag,size,width,height,depth,weight,quality,freshness,packeting,regularprice,saleprice,date, } = req.body;

    const stock = req.body.stock  === 'on';
    const publish= req.body.publish === 'on';
    const priceincludestaxes  = req.body.priceincludestaxes === 'on';


    const productData = await Product.findOne({title:title,brand:brand,category:category,subcategory:subcategory,size:size,gender:gender});

    
    if(productData){
      res.render('productEdit');
    }
    else{
      const product = new Product({
        title:title,
        description:description,
        brand:brand,
        defaultimage:req.files.defaultImage[0].filename,
        galleryimage:req.files.galleryImage.map(file=>file.filename),
        category:category,
        subcategory:subcategory,
        stock:stock,
        gender:gender,
        tag:tag,
        size:size,
        width:width,
        height:height,
        depth:depth,
        weight:weight,
        quality:quality,
        freshness:freshness,
        packeting:packeting,
        regularprice:regularprice,
        saleprice:saleprice,
        priceincludestaxes:priceincludestaxes,
        date:date,
        publish:publish

      });

      const productDataAdded  = await product.save();
      if(productDataAdded){
        res.redirect('/admin/productEdit');
      }
      else{
        res.render('productEdit')
      }
    }
    

  } catch (error) {
    console.log(error.message);
  }

}

const addCategory = async (req, res) => {
  try {
    const { maincategory } = req.body;
    console.log(maincategory);

    // Check if a category with the same maincategory already exists
    const categoryData = await Category.findOne({ maincategory: maincategory });
    console.log(categoryData);

    console.log(1);
    if (!categoryData) {

      console.log(2);
      const categoryDataAdded = new Category({
        maincategory: maincategory,
        subcategory: []
      });

      console.log('Data being saved:', categoryDataAdded);

const categoryDataUpdated = await categoryDataAdded.save();


      console.log('new added');
      const categoryDataUpdated1 = await categoryDataAdded.save();
      console.log('6');
      if (categoryDataUpdated1) {
        res.render('productEdit', { categorymessage: "Category added successfully" });
      }
      
    } else {
      res.render('productEdit', { categorymessage: "Category already exists" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const addSubCategory = async (req, res) => {

  try {
    console.log(3);
    const { maincategory,subcategory } = req.body;
    console.log(maincategory);
    
    console.log(subcategory);

    // Find the category by its ID
    const categoryfound = await Category.findOne({maincategory:maincategory});

    if (!categoryfound) {
      console.log("category not found");
      res.render('productEdit',{categorymessage:"already exist"});
    }
    else{
      const subcategoryfound  = await Category.findOne({maincategory:maincategory,subcategory:{$elemMatch:{subcategory:subcategory}}});

      if(subcategoryfound){
        res.render('productEdit',{categoryfound:"sub category already exist"});
      }
      else{
        categoryfound.subcategory.push({ subcategory: subcategory });
        const updatedCategory = await categoryfound.save();

        console.log('sub category added');
        res.render('productEdit',{categorymessage:"sub category added"});
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports  = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  signout,
  ecommerceCustomer,
  addCustomer,
  blockUser,
  unblockUser,
  productEditLoad,
  addProduct,
  addCategory,
  addSubCategory
}