const User       = require('../models/userModel');

const bcrypt     =  require('bcrypt');

const bodyParser = require('body-parser');

const session = require('express-session');

const Product = require('../models/productModel');

const mongoose  = require('mongoose');

const Cart      = require('../models/cartModel');

const securePassword  = async(password)=>{

  try {
    
    const hashedPassword  = await bcrypt.hash(password,10);
    return hashedPassword;

  } catch (error) {
    console.log(error.message);
  }

}

const nodemailer = require('nodemailer');

const config     = require('../config/config');

const otpObj = {
  otp:()=>{
    const otp = Math.floor(1000+Math.random()*9000);
    console.log(3);
    return otp.toString();
  }
}

const sendOtp = async(email,otp)=>{
  try {
    console.log(4);
    
    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });

    console.log(5);
    const mailOption = {
      from:'vishnu18js@gmail.com',
      to:email,
      subject:"Otp for verification",
      html:'<p>your otp for creating account in adlante is '+otp+' . please copy and paste it in the otp box.</p>'
    }

    transporter.sendMail(mailOption,(error,info)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log("otp has been sent : ",info.response);
      }
    })

  } catch (error) {
    console.log(error.message);
  }
}

const loadLogin = async(req,res)=>{
  try {
    
    res.render('login',{message:''});
    console.log("2");

  } catch (error) {
    console.log(error.message);
  }
}

const loadRegister  = async(req,res)=>{

  try {
    
    res.render('registration',{message:''});

  } catch (error) {
    console.log(error.message);
  }

}

const loadOtpVerification = async(req,res)=>{

  try {
    const { name,email,mobile,password } = req.body;
    const checkMail = await User.findOne({email:email});
    const checkNum  = await User.findOne({mobile:mobile});
    
    req.session.email=email;
    req.session.mobile=mobile;
    req.session.name=name;
    req.session.password=password;

    if(checkMail){
      res.render('registration',{message:"Email already used"});
      req.session.destroy();
    }
    else if(checkNum){
      res.render('registration',{message:"phone number already used"});
      req.session.destroy();
    }
    else{

      const otp = otpObj.otp();
      console.log(otp);
      sendOtp(email,otp);
      req.session.otp = otp;
      res.render('verification',{message:''});
    }

  } catch (error) {
    console.log(error.message);
    res.render('registration',{message:"invalid input"});
  }

}

const resend  = async(req,res)=>{
  try {
    const email=req.session.email;
    res.render('verification',{message:''});
    const otp = otpObj.otp();
    req.session.otp = otp;
    sendOtp(email,otp);

  } catch (error) {
    console.log(error.message);
  }
}


const insertUser  = async(req,res)=>{

  try {
    
    const {number1,number2,number3,number4} = req.body;
    const enteredNumber = `${number1}${number2}${number3}${number4}`;
    const { otp:storedOtp, name:storedName, email:storedEmail, mobile:storedMobile, password:storedPassword } = req.session;

    console.log('inserting');
    const sPassword = await securePassword(storedPassword);

    console.log(storedOtp);
    console.log(enteredNumber);


    if(enteredNumber === storedOtp){
      const user  = new User({
        name: storedName,
        email:storedEmail,
        mobile:storedMobile,
        password:sPassword,
        is_verified:1
      })

      const userData  = await user.save();
      if(userData){
        res.render('verification',{message:"Registration successfull. Please login"});
      }
    }
    
  } catch (error) {
    console.log(error.message);
  }

}

const verifyLogin = async(req,res)=>{

  try {
    
    const {emailOrPhone,password} = req.body;
    
    const userData  = await User.findOne({email:emailOrPhone});
    console.log(userData);
    const secur = await securePassword(password);
    console.log(secur);

    if(userData){
      
      const passwordMatch = await bcrypt.compare(password,userData.password);
      if(passwordMatch){

        req.session.user_id = userData._id;
        res.redirect('/homepage');
        console.log(req.session.user_id);
      }
      else{
        res.render('login',{message:"incorrect credentials"});
      }

    }
    else{
      res.render('login',{message:"incorrect credentials"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadForgot  = async(req,res)=>{

  try {
    
    res.render('forgot');

  } catch (error) {
    console.log(error.message);
  }

}

const forgotPassword  = async(req,res)=>{

  try {
    
    const { email:enteredMail } = req.body;
    console.log(enteredMail);
    const userData  = await User.findOne({email:enteredMail});
    console.log(userData);

    if(userData){
      req.session.enteredMail = enteredMail;
      sendMail(enteredMail,userData.name);
      res.render('forgot',{alertmessage:"a password resetting link has been sent to your mail."})
    }
    else{
      res.render('forgot',{alertmessage:"enter a valid email"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const sendMail = async(email,name)=>{
  
  try {
    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });

    const mailOption = {
      from:'vetkot pvt ltd',
      to:email,
      subject:"Password reset link",
      html: `<p> Hi ${name}, for resetting password click <a href="http://127.0.0.1:7001/resetPassword?email=${email}">here</a></p>`
    }

    transporter.sendMail(mailOption,(error,info)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log("reset link has been sent : ",info.response);
      }
    })

  } catch (error) {
    console.log(error.message);
  }
}

const resetPassword = async(req,res)=>{

  try {

    req.session.email = req.query.email;

    res.render('resetPassword');
    
  } catch (error) {
    console.log(error.message);
  }

}

const resetPasswordbyForgot = async(req,res)=>{

  try {
    
    const email = req.session.email;
    console.log(email);
    const { password:newPassword } = req.body;
    console.log(newPassword);
    const sPassword = await securePassword(newPassword);
    console.log(sPassword);

    const updatedData = await User.updateOne({email:email},{$set:{password:sPassword}});
    console.log(updatedData);
    req.session.destroy();
    if(updatedData.modifiedCount === 1){
      res.redirect('/');
    }
    else{
      res.redirect('/');
    }


  } catch (error) {
    console.log(error.message);
  }

}

const loadHome  = async(req,res)=>{

  try {
    console.log('executing')
    res.render('homepage');
    console.log("4");

  } catch (error) {
    console.log(error.message);
  }
}

const logout  = async(req,res)=>{

  try {
    req.session.destroy();
    res.redirect('/');
    console.log(req.session)

  } catch (error) {
    console.log(error.message);
  }

}

const loadShop  = async(req,res)=>{

  try {
    
    const userID  = req.session.user_id;
    const user    = await User.findById({_id:userID});
    const product = await Product.find();
    res.render('shop',{products:product,user:user});
    console.log("shop loading");

  } catch (error) {
    console.log(error.message);
  }

}

const myProfileLoad = async(req,res)=>{
  console.log('profile loading');

  try {
    
    const userID = req.session.user_id;
    console.log(userID);
    const user = await User.findById({_id:userID});
    res.render('myProfile',{user:user});

  } catch (error) {
    console.log(error.message);
  }

}

const addAddress  = async(req,res)=>{

  try {
    
    const{ userName,houseName,postOffice,landmark,district,state,country,pin,contactNumber } = req.body;
    const userID  = req.session.user_id;
    console.log(contactNumber);

    const user  = await User.findById({_id:userID});

    const newAddress  = {
      userName,
      houseName,
      postOffice,
      landmark,
      district,
      state,
      country,
      pin,
      contactNumber,
      makeDefault:Date.now()
    }

    user.address.push(newAddress);

    await user.save();

    res.redirect('/myProfile');

  } catch (error) {
    console.log(error.message);
  }

}


const editAddress = async (req, res) => {
  try {
    const { houseName, postOffice, landmark, district, state, country, pin, contactNumber } = req.body;
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });

    // Find the index of the document with the lowest makeDefault value
    const index = user.address.reduce((minIndex, currentAddress, currentIndex, addresses) => {
      const currentMakeDefault = currentAddress.makeDefault || 0;
      const minMakeDefault = addresses[minIndex].makeDefault || 0;

      return currentMakeDefault < minMakeDefault ? currentIndex : minIndex;
    }, 0);

    // Update only the provided data in the document at the found index
    const updateData = { $set: {} };

    const trimAndCheck = (value) => {
      const trimmedValue = value.trim();
      return trimmedValue !== '';
    };

    if (trimAndCheck(houseName)) {
      updateData.$set[`address.${index}.houseName`] = houseName.trim();
    }
    if (trimAndCheck(postOffice)) {
      updateData.$set[`address.${index}.postOffice`] = postOffice.trim();
    }
    if (trimAndCheck(landmark)) {
      updateData.$set[`address.${index}.landmark`] = landmark.trim();
    }
    if (trimAndCheck(district)) {
      updateData.$set[`address.${index}.district`] = district.trim();
    }
    if (trimAndCheck(state)) {
      updateData.$set[`address.${index}.state`] = state.trim();
    }
    if (trimAndCheck(country)) {
      updateData.$set[`address.${index}.country`] = country.trim();
    }
    if (trimAndCheck(pin)) {
      updateData.$set[`address.${index}.pin`] = pin.trim();
    }
    if (trimAndCheck(contactNumber)) {
      updateData.$set[`address.${index}.contactNumber`] = contactNumber.trim();
    }

    const userData = await User.updateOne({ _id: userID }, updateData);

    if (userData.modifiedCount === 1) {
      res.redirect('/myProfile');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  console.log('deleting');

  try {
    
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const { makeDefault } = req.body;
    const formattedDate = new Date(Date.parse(makeDefault));
    console.log(formattedDate);

    const index = user.address.reduce((index, currentAddress, currentIndex, addresses) => {
      const currentMakeDefault = currentAddress.makeDefault || 0;
      console.log(currentAddress.makeDefault);

      return currentMakeDefault.toISOString().substring(0,19) === formattedDate.toISOString().substring(0,19) ? currentIndex : index;
    }, -1);
    console.log(index);

    if (index !== -1) {

      user.address.splice(index,1);

      const userData  = await user.save();

      if (userData) {
        res.redirect('/myProfile');
      } else {
        console.log('userdata not updated');
      }
    }

  } catch (error) {
    console.log(error.message);
  }
};

const makeDefaultAddress  = async(req,res)=>{
console.log('making default');
  try {
    
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const { makeDefault } = req.body;
    const formattedDate = new Date(Date.parse(makeDefault));
    console.log(formattedDate);

    const index = user.address.reduce((index,currentAddress,currentIndex,addresses)=>{

      const currentMakeDefault  = currentAddress.makeDefault;

      return currentMakeDefault.toISOString().substring(0,19) === formattedDate.toISOString().substring(0,19) ? currentIndex : index ;
    },-1);

    user.address[index].makeDefault = Date.now();
    
    const userData  = await user.save();
    if(userData){
      res.redirect('/myProfile');
    }
    else{
      console.log('not set default');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const productDetails  = async(req,res)=>{

  try {
    
    const { productID } = req.body;

    req.session.productID = productID;

    console.log(req.session.productID);
    
    res.redirect('/loadProductDetails');

  } catch (error) {
    console.log(error.message);
  }

}

const loadProductDetails  = async(req,res)=>{

  try {
    
    const productID = req.session.productID;
    const userID    = req.session.user_id;
    console.log(productID);

    const product = await Product.findOne({_id:productID});
    const cart    = await Cart.findOne({userID:userID})

    if(product){

      res.header('Cache-Control','no-store , no-cache , must-revalidate');
      res.render('productDetails',{product:product,cart:cart});
      delete req.session.productID;
      
    }
    else{
      console.log('product not found');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const addToCart = async(req,res)=>{

  try {
    
    const { productID,quantity } = req.body;
    const userID  = req.session.user_id;
    req.session.productID = productID;

    const CartFound = await Cart.findOne({userID:userID});

    if(!CartFound){

      const cart  = new Cart({
        userID:userID,
        items:[
          {productId:productID,
          quantity:parseInt(quantity)}
        ]
      });

      cart.save();
      res.redirect('/loadProductDetails');

    }
    else{

      const cart  = await Cart.findOne({userID:userID});

      const productIds  = cart.items.map(item=>item.productId);

      const productExist  = productIds.includes(productID);

      if(productExist){

        const existingItem  = cart.items.find((item)=>item.productId === productID);
        existingItem.quantity += parseInt(quantity);
        await cart.save();
        res.redirect('/loadProductDetails');

      }
      else{

        cart.items.push({productId:productID,quantity:parseInt(quantity)});
        await cart.save();
        res.redirect('/loadProductDetails');

      }
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadCartPage  = async(req,res)=>{

  try {
    
    const userID  = req.session.user_id;
    const userCart    = await Cart.findOne({userID:userID});

    const productIds  = userCart.items.map(item=>item.productId);

    const products    = await Product.find({_id:{$in:productIds}});

    const initialSubtotal = userCart.items.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      return total + (product.saleprice * item.quantity);
    }, 0);


    res.render('cartPage',{products,cart:userCart,initialSubtotal});

  } catch (error) {
    console.log(error.message);
  }

}

const updateCart  = async(req,res)=>{

  try {

    const updatedQuantity = {};

    for(let key in req.body){
      
      if(key.startsWith('quantity_')){

        const productID = key.replace('quantity_','');
        const quantity  = parseInt(req.body[key],10);
        updatedQuantity[productID]  = quantity;

      }
    }

    const userID    = req.session.user_id;
    const userCart  = await Cart.findOne({userID:userID});

    userCart.items.forEach((item)=>{

      if(updatedQuantity[item.productId]){
        
        item.quantity = updatedQuantity[item.productId];

      }
    });

    const cartUpdated = await userCart.save();

    if(cartUpdated){
      
      res.redirect('/cartPage');

    }
    else{
      console.log('not updated');
    }

  } catch (error) {
    console.log(error.message);
  }

}


const deleteFromCart  = async(req,res)=>{
  console.log('item deleting..');

  try {

    const { deleteProductId } = req.body;
    console.log(deleteProductId);

    const userID    = req.session.user_id;
    const userCart  = await Cart.findOne({userID:userID});

    userCart.items  = userCart.items.filter(item=>item.productId !== deleteProductId);

    const itemDeleted = await userCart.save();

    if(itemDeleted){
      res.redirect('/cartPage');
      console.log('item deleted');
    }
    else{
      console.log('item not deleted');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const proceedToCheckout = async(req,res)=>{

  try {
    
    res.render('checkoutPage');

  } catch (error) {
    console.log(error.message);
  }

}




module.exports  = {
  loadLogin,
  loadRegister,
  loadOtpVerification,
  resend,
  insertUser,
  verifyLogin,
  loadForgot,
  forgotPassword,
  sendMail,
  loadHome,
  logout,
  loadShop,
  resetPassword,
  resetPasswordbyForgot,
  myProfileLoad,
  addAddress,
  editAddress,
  deleteAddress,
  makeDefaultAddress,
  productDetails,
  loadProductDetails,
  addToCart,
  loadCartPage,
  updateCart,
  deleteFromCart,
  proceedToCheckout,
}