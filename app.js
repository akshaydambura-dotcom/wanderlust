if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const flash=require("connect-flash");
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
const dbUrl=process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log(err));
const store=new MongoStore({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});
store.on("error",(err)=>{
  console.log("error in mongo store",err);
});
// Routes
const sessionOptions = {
  store,
  secret: process.env.SECRET,   // REQUIRED
  resave: false,
  saveUninitialized: true,
cookie:{
  expires: new Date(Date.now() + 1000*60*60*24*3),
  maxAge:1000*60*60*24*3,
  httpOnly:true
},
};



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// app.get('/', (req, res) => {
//   res.send('hi, i am root');
// });

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async (req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"akshay"
//   });

//  let registerdUser= await User.register(fakeUser,"helloworld");
//  res.send(registerdUser);
// });








app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)



// 404 handler (Express 5 compatible)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
app.use((err,req,res,next)=> {
  let {statusCode=500,message="Some thing went wrong"}=err;
  res.status(statusCode).render("error.ejs",{message});
// res.status(statusCode).send(message);
});
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
