const {check,validationResult}= require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => 
  {res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn:false,
    errors:[],
    oldInput:{email:""},
    user:{},
  });
};

exports.postLogin= async (req,res,next)=>{
  const {email,password}=req.body;
  const user= await User.findOne({email:email});
  if(!user){
    return res.status(422).render("auth/login",{
      pageTitle:"Login",
      currentPage:"login",
      isLoggedIn:false,
      errors:[{msg:"User does not exist"}],
      oldInput:{email},
      user:{},
    })
  }
  const match=await bcrypt.compare(password,user.password);
  if(!match){
    return res.status(422).render("auth/login",{
      pageTitle:"Login",
      currentPage:"login",
      isLoggedIn:false,
      errors:[{msg:"Invalid password"}],
      oldInput:{email},
      user:{}
    })
  }
  req.session.isLoggedIn=true;
  req.session.user=user;
  await req.session.save();
  res.redirect("/")
};

exports.postLogout=(req,res,next)=>{
  req.session.destroy(()=>{
    res.redirect("/login")
  });
}

exports.getSignup=(req,res,next)=>{
  res.render("auth/signup",{
    pageTitle:"signup",
    currentPage:"signup",
    isLoggedIn:false,
    oldInput:{firstName: "", lastName: "", email: "", userType: ""},
    errors:[],
    user:{},
  })
}

exports.postSignup=[
  check('firstname')
  .trim()
  .isLength({min:2})
  .withMessage("First name must be at least 2 characters long")
  .matches(/^[a-zA-Z]+$/)
  .withMessage("First name must contain only contain alphabets"),

  check('lastname')
  .matches(/^[a-zA-Z]+$/)
  .withMessage("Last name must contain only contain alphabets"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email address")
  .normalizeEmail(),
  
  check("password")
  .isLength({min:6})
  .withMessage("Password must be at least 6 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage("Password must contain at least one special character"),
   
  check("confirmPassword")
  .trim()
  .custom((value,{req})=>{
    if(value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("usertype")
  .notEmpty()
  .isIn(["guest", "host"])
  .withMessage("User type must be either 'guest' or 'host'"),

  check("terms")
  .notEmpty()
  .withMessage("You must accept the terms and conditions")
  .custom((value, { req }) => {
    if (value !== "on") {
      throw new Error("You must accept the terms and conditions");
    }
    return true;
  }),

  (req,res,next)=>{
    const {firstname,lastname,email,password,usertype}=req.body;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).render("auth/signup",{
        pageTitle:"signup",
        currentPage:"signup",
        isLoggedIn:false,
        errors:errors.array(),
        oldInput:{firstname,lastname,email,password,usertype},
        user:{},
      });
    }
    const user = new User({
      firstname,
      lastname,
      email,
      password,
      userType: usertype
    });
    bcrypt.hash(password,12)
    .then(hashedpassword=>{
      const user =new User({firstname,lastname,email,password:hashedpassword,userType:usertype});
      return user.save();
    })
    .then(()=>{
      res.redirect("/login");
    }).catch(err=>{
      return res.status(422).render("auth/signup",{
        pageTitle:"signup",
        currentPage:"signup",
        isLoggedIn:false,
        errors:[err.msg],
        oldInput:{firstname,lastname,email,password,usertype},
        user:{},
      });      
    });
    
}]
