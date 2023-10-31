const Admin = require('../models/adminModel');
const Product= require('../models/productModel');
const User  = require('../models/userModel');
const bcrypt= require('bcrypt');
const session = require('express-session');
const Category= require('../models/categoryModel');
const Order = require('../models/orderModel');
const Coupon  = require('../models/couponModel');
const Banner  = require('../models/bannerModel');

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
    const updatedEmail  = email.toLowerCase()
    const UserData  = await User.findOne({email:updatedEmail});
    if(UserData){
      res.render('ecommerce-customer',{customeradd:"user already exists"});
    }
    else{
      const user  = new User({
        name:name,
        email:updatedEmail,
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
    
    const { selectedEmails } = req.body

    const updated = await User.updateMany({email:{$in:selectedEmails}},{$set:{active:"blocked"}});
    console.log("data updated");
    res.render('ecommerce-customer',{customeradd:"user blocked"});

    

  } catch (error) {
    console.log(error.message);
  }

}

const loadProductList = async(req,res)=>{

  try {
    
    const products = await Product.find();
    console.log(products);
    res.render('productList',{products:products});

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
    const currentCategory = categories[0];
    const productData = await Product.find();
    res.render('productEdit',{alertMessage:"",products:productData,categories:categories,currentCategory:currentCategory});

  } catch (error) {
    console.log(error.message);
  }

}

const addProduct  = async(req,res)=>{

  try {
    
    console.log(req.body);
    const {stock,title,description,brand,category,subcategory,gender,tag,size,width,height,depth,weight,quality,freshness,packeting,regularprice,saleprice,date, } = req.body;

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
        res.render('productEdit',{alertMessage:"successfull"});
      }
      else{
        res.render('productEdit')
      }
    }

  } catch (error) {
    console.log(error.message);
  }

}

const categorylistLoad  = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    res.render('categoryList',{categories:categories});
    delete req.session.maincategory;

  } catch (error) {
    console.log(error.message);
  }

}

const addCategoryload = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    res.render('addCategorypage',{categories:categories,categoryMessage:""});

  } catch (error) {
    console.log(error.message);
  }

}

const addCategoryPage = async(req,res)=>{

  try {
    
    const { maincategory,description,visibility } = req.body;
    const categories  = await Category.find();
    const category  = await Category.findOne({maincategory:new RegExp(maincategory,'i')});

    if(!category){
      const newCategory = new Category({
        maincategory:maincategory,
        description:description,
        visibility:visibility
      })

      const categoryUpdated = await newCategory.save();

      if(categoryUpdated){
        res.redirect('/admin/categoryList');
      }
      else{
        res.render('addCategorypage',{alert:"no category added"});
      }
    }
    else{
      res.render('addCategorypage',{categories:categories,categoryMessage:"item already exists"});
    }

  } catch (error) {
    console.log(error.message);
  }

}


const subcategoryListLoad = async (req, res) => {
  try {
    const { mainCategory } = req.body;
    req.session.maincategory = mainCategory;

    const category = await Category.findOne({ maincategory: mainCategory });
    res.render('subcategoryList', { mainCategory: category });
  } catch (error) {
    console.error(error.message);
    res.render('errorPage', { error: 'An error occurred while loading subcategory list' });
  }

}


const editSubcategoryLoad = async(req,res)=>{

  try {
    
    const { subcategory}  = req.body;
    res.render('editSubcategoryPage');

  } catch (error) {
    console.log(error.message);
  }

}

const addSubcategoryPage = async (req, res) => {
  try {
    const { subcategoryName, description, visibility } = req.body;
    const mainCategory = req.session.maincategory;

    const category = await Category.findOne({ maincategory: mainCategory });

    const subcategoryExist = category.subcategory.some((subcategory) => subcategory.name === new RegExp(subcategoryName,'i'));
    if (!subcategoryExist) {
      category.subcategory.push({
        name: subcategoryName,
        description: description,
        visibility: visibility,
      });

      await category.save(); // Save changes to the database
      console.log(5);
      res.redirect('/admin/subcategoryList');
      console.log(6);
    } else {
      res.redirect('/admin/subcategoryList');
    }
  } catch (error) {
    console.error(error.message);
    res.render('subcategoryList', { alert: 'Error adding subcategory' });
  }

}

const updatedSubcategoryList  = async(req,res)=>{

  try {
    
    const mainCategory  = req.session.maincategory;
    const category  = await Category.findOne({maincategory:mainCategory});
    res.render('subcategoryList',{mainCategory:category});

  } catch (error) {
    console.log(error.message);
  }

}

const addSubcategoryLoad  = async(req,res)=>{

  try {
    
    res.render('addSubcategoryPage');

  } catch (error) {
    console.log(error.message);
  }
  
}

const orderListLoad = async(req,res)=>{

  try {
    
    const orders = await Order.find();
    res.render('orderList',{orders:orders});

  } catch (error) {
    console.log(error.message);
  }

}

const placeOrder  = async(req,res)=>{

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:'order placed'}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orerMessage:"order status updated"});
    }


  } catch (error) {
    console.log(error.message);
  }

}

const shipOrder = async(req,res)=>{
  console.log('shipping');

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:'order has been shipped'}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orderMessage:"order status updated"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const deliverOrder  = async(req,res)=>{

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:"order has been delivered"}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orderMessage:"order status updated"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const editProductLoad = async(req,res)=>{

  try {

    const categories  = await Category.find();
    const { productId } = req.body;
    const product = await Product.findById({_id:productId});
    res.render('editProduct',{product:product,categories:categories});

  } catch (error) {
    console.log(error.message);
  }

}

const addCouponLoad  = async(req,res)=>{

  try {
    
    res.render('addCoupon');

  } catch (error) {
    console.log(error.message);
  }

}

const addCoupon = async(req,res)=>{

  try {
    
    const { code, type, discountValue, usageLimit, status, startDate, endDate } =  req.body;
    const couponExist = await Coupon.findOne({code:code});
    console.log(code);
    console.log(type)
    console.log(discountValue);
    console.log(usageLimit);
    console.log(status);
    console.log(startDate);
    console.log(endDate);


    if(!couponExist){
      const newCoupon = new Coupon({
        code:code,
        type:type,
        discountValue:discountValue,
        usageLimit:usageLimit,
        status:status,
        startDate:startDate,
        endDate:endDate
      })

      const couponSaved = newCoupon.save();

      if(couponSaved){
        res.render('addCoupon',{alertMessage:"new coupon added"});
      }
    }

  } catch (error) {
    console.log(error.message);
  }

}

const couponListLoad  = async(req,res)=>{

  try {
    
    const coupons = await Coupon.find();
    console.log(coupons);
    res.render('couponList',{coupons:coupons});

  } catch (error) {
    console.log(error.message);
  }

}

const bannerManagementLoad  = async(req,res)=>{

  try {
    
    const banner = await Banner.findOne();
    res.render('bannerManagementPage',{banner:banner});

  } catch (error) {
    console.log(error.message);
  }

}

const addCheckoutBanner = async(req,res)=>{

  try {
    
    const checkoutBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({checkoutBannerImage});
      await newBanner.save();
    }
    else{
      banner.checkoutBannerImage  = checkoutBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addShopBanner = async(req,res)=>{

  try {
    
    const shopBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({shopBannerImage});
      await newBanner.save();
    }
    else{
      banner.shopBannerImage  = shopBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addProductDetailBanner = async(req,res)=>{

  try {
    
    const singleProductBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({singleProductBannerImage});
      await newBanner.save();
    }
    else{
      banner.singleProductBannerImage  = singleProductBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addCartBanner = async(req,res)=>{

  try {
    
    const cartPageBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({cartPageBannerImage});
      await newBanner.save();
    }
    else{
      banner.cartPageBannerImage  = cartPageBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

module.exports  = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  signout,
  ecommerceCustomer,
  addCustomer,
  blockUser,
  unblockUser,
  loadProductList,
  productEditLoad,
  addProduct,
  categorylistLoad,
  addCategoryload,
  addCategoryPage,
  subcategoryListLoad,
  addSubcategoryLoad,
  addSubcategoryPage,
  editSubcategoryLoad,
  updatedSubcategoryList,
  orderListLoad,
  placeOrder,
  shipOrder,
  deliverOrder,
  editProductLoad,
  addCouponLoad,
  addCoupon,
  couponListLoad,
  bannerManagementLoad,
  addCheckoutBanner,
  addShopBanner,
  addProductDetailBanner,
  addCartBanner,
}