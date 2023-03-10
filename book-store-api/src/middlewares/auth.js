const jwt = require("jsonwebtoken");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const auth = async (req, res, next) => {
  try {
    // console.log(req.session.receiverInfo);
    let token = req.header("Authorization").split(" ")[1];
    if (!token) {
      token = req.header("Authorization").slice(6);
    }
    const decode = jwt.verify(token, "SEC_JWT");
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    // console.log(decode);
    // console.log(user);
    //Check user not exist
    if (!user) throw new Error();

    req.user = user;
    req.token = token;
    req.role = decode.role;
    console.log(req.user.email);
    next();
  } catch (e) {
    console.log(e);
    //Case: Not token, not valid token, user not found(jwt not valid)
    res.status(401).send({ error: "Please authenticate" });
  }
};

// const authEGuest = async (req, res, next) => {
//   console.log(req.session.guest);
//   if (!req.session.guest) {
//     const userId = new ObjectId();
//     req.session.guest = { _id: userId, role: role._id };
//     req.session.cartGuest = {
//       _id: new ObjectId(),
//       totalCost: 0,
//       items: [],
//       user: userId,
//     };
//   }

//   next();
// };

module.exports = { auth };
