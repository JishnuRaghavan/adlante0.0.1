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

admin_route.get('/productEdit',adminController.productEditLoad);
admin_route.post('/addCategory',adminController.addCategory);
admin_route.post('/addSubCategory',adminController.addSubCategory);

admin_route.post('/addProduct',cpupload,adminController.addProduct);
admin_route.get('*',(req,res)=>{
  res.redirect('/admin');
})

module.exports = admin_route;