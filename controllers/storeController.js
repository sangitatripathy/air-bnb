const Home = require("../models/home");
const User =require("../models/user");

exports.getIndex = (req, res, next) => {
  console.log("Session value:",req.session)
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb home",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user:req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.session.isLoggedIn,
      user:req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.session.isLoggedIn,
    user:req.session.user,
  });
};


exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("At home details page", homeId);
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found");
      res.redirect("/homes");
    } else {
      console.log("Home details found", home);
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Details",
        currentPage: "Home",
        isLoggedIn: req.session.isLoggedIn,
        user:req.session.user,
      });
    }
  });
};

exports.getFavouriteList = async(req, res, next) => {
  const userID=req.session.user._id;
  const user=await User.findById(userID).populate('favourite');
    res.render("store/favourite-list", {
    favouriteHomes: user.favourite,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn:req.session.isLoggedIn,
    user:req.session.user,
  });  
};

exports.postAddToFavourite = async(req, res, next) => {
  const homeId = req.body.id;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  if(!user.favourite.includes(homeId)){
    user.favourite.push(homeId);
    await user.save();
  }  
  return res.redirect("/favourites")
};

exports.postRemoveFromFavourite = async(req, res, next) => {
  const homeId = req.params.homeId;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  if (user.favourite.includes(homeId)){
    user.favourite=user.favourite.filter(fav=>fav != homeId)
    await user.save()
  } 
    res.redirect("/favourites");  
};
