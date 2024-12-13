const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import models and utilities
const { OrderModel } = require("./models/OrderModel");
const { HoldingModel } = require("./models/HoldingModel");
const { PositionModel } = require("./models/PositionModel");
const { UserModel } = require("./models/UserModel");
const { createSecretToken, userVerification } = require("./utils/SecretToken");

// Environment variables
const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;
const frontendURL = ["http://localhost:3000","http://localhost:3001"];

app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());


app.post("/signup", async (req, res, next) => {
  try {
    const email = req.body.email
    const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.json({ message: "User already exists" });
  }
  const newUser = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  const user = await newUser.save();
  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    withCredentials: true,
    httpOnly: false,
  });
  res
    .status(201)
    .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.log("Error on Signup: ", error)
  }
});

app.post("/login",async (req,res,next) => {
  try {
    const { email, password } = req.body;

    if(!email || !password ){
      return res.json({message:'All fields are required'})
    }

    const user = await UserModel.findOne({ email });
    if(!user){
      return res.json({message:'Incorrect password or email' }) 
    }

    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.json({message:'Incorrect password or email'}) 
    }

     const token = createSecretToken(user._id);
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });

     res.status(201).json({ message: "User logged in successfully", success: true, user });
     next();
  } catch (error) {
    console.log("Error on login: ",error)
  }
})

app.get("/user", userVerification, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/allHoldings", async (req, res) => {
  const allHoldings = await HoldingModel.find({});
  res.json(allHoldings);
});
app.get("/allOrders", async (req, res) => {
  const allOrders = await OrderModel.find({});
  res.send(allOrders);
});
app.get("/allPositions", async (req, res) => {
  const allPositions = await PositionModel.find({});
  res.send(allPositions);
});

app.listen(PORT, () => {
  console.log("App started");
  mongoose.connect(url);
  console.log("Db connected");
});
