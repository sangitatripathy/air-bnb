// Core Module
const path = require('path');

// External Module
const express = require('express');
const cookieParser = require('cookie-parser');
const session=require('express-session');
const MongoDBStore=require('connect-mongodb-session')(session)
const DB_PATH="mongodb+srv://root:liti2005@my-first-project.bqd9b4u.mongodb.net/airbnb?retryWrites=true&w=majority&appName=my-first-project";


//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter=require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose } = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
const store=new MongoDBStore({
  uri:DB_PATH,
  collection:'sessions'
})

app.use(express.urlencoded());
app.use(session({
  secret:"Mykey",
  resave:false,
  saveUninitialized:true,
  store
}))
// app.use(cookieParser());
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});
app.use(authRouter)
app.use(storeRouter);
app.use("/host",(req,res,next)=>{
  if(req.isLoggedIn){
    next();
  }
  else{
    res.redirect("/login")
  }
})
app.use("/host", hostRouter);

app.use(express.static(path.join(rootDir, 'public')))

app.use(errorsController.pageNotFound);

const PORT = 3002;



mongoose.connect(DB_PATH).then(()=>{
  console.log("connected to MongoDB")
  app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
}).catch(err=>{
  console.log("Error while connecting to mongo",err)
})


