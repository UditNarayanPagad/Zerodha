require("dotenv").config();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/UserModel");

module.exports.createSecretToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

module.exports.userVerification = async (req, res,next) => {
  const token = await req.cookies.token
  if (!token) {
    return res.json({ status: false, message: "No token provided" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ status: false, message:"Error! Not authorized"  })
    } else {
      const user = await UserModel.findById(data.id)
      if (user) {
        req.user = user
        next();
      }
      else return res.json({ status: false, message:"Not authorized" })
    }
  })
}