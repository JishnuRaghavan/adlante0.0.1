const express = require('express');
const admin_route = express();

const session     = require('express-session');
const config      = require('../config/config');
admin_route.use(session({secret:config.sessionSecret}));

const bodyParser  = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

const multer  = require("multer");
const path    = require("path");

admin_route.use(express.static('public'));

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/productimg'))
  },
  filename:function(req,file,cb){
    const name  = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

const upload  = multer({
  storage:storage
});

const cpupload  = upload.fields([{name:'defaultImage',maxCount:1},{name:'galleryImage',maxCount:10}]);

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const adminController = require('../controllers/adminController');
const auth  = require('../middlewares/adminAuthentication.js');


admin_route.get('/',auth.isLoggedout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.post('/signin',adminController.verifyLogin);
admin_route.get('/signin',(req,res)=>{
  res.redirect('/admin');
});
admin_route.get('/adminhome',auth.isLoggedin,adminController.loadDashboard);
admin_route.get('/signout',adminController.signout);

admin_route.get('/ecommerce-customer',adminController.ecommerceCustomer);

admin_route.post('/customeradd',adminController.addCustomer);

admin_route.post('/block-users',adminController.blockUser);
admin_route.post('/unblock-users',adminController.unblockUser);

admin_route.get('/productList',adminController.loadProductList);
admin_route.get('/productEdit',adminController.productEditLoad);
admin_route.post('/addProduct',cpupload,adminController.addProduct);
admin_route.get('/categoryList',adminController.categorylistLoad);
admin_route.get('/addCategorypage',adminController.addCategoryload);
admin_route.get('/subcategoryList',adminController.updatedSubcategoryList);
admin_route.post('/addCategoryPage',adminController.addCategoryPage);
admin_route.post('/subcategoryList',adminController.subcategoryListLoad);
admin_route.get('/addSubcategoryPage',adminController.addSubcategoryLoad);
admin_route.post('/addSubcategoryPage',adminController.addSubcategoryPage)
admin_route.post('/editSubcategoryPage',adminController.editSubcategoryLoad);
admin_route.get('/orderList',adminController.orderListLoad);
admin_route.post('/order-placed',adminController.placeOrder);
admin_route.post('/order-shipped',adminController.shipOrder);
admin_route.post('/order-delivered',adminController.deliverOrder);
admin_route.post('/editProduct',adminController.editProductLoad);
admin_route.get('/addCoupon',adminController.addCouponLoad);
admin_route.post('/addCoupon',adminController.addCoupon);
admin_route.get('/couponList',adminController.couponListLoad);

admin_route.get('/bannerManagement',adminController.bannerManagementLoad);
admin_route.post('/addShopBanner',upload.single('shopBannerImage'),adminController.addShopBanner);
admin_route.post('/addProductDetailBanner',upload.single('singleProductBannerImage'),adminController.addProductDetailBanner);
admin_route.post('/addCartBanner',upload.single('cartPageBannerImage'),adminController.addCartBanner);
admin_route.post('/addCheckoutBanner',upload.single('checkoutBannerImage'),adminController.addCheckoutBanner);
admin_route.get('*',(req,res)=>{
  res.redirect('/admin');
})

module.exports = admin_route;