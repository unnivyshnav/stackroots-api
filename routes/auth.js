const router = require("express").Router();

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");
const argon2 = require("argon2");
var hash;

//user registration
router.post("/register", async (req, res) => {
  try {
    hash = await argon2.hash(req.body.password);
  } catch (err) {
    //...
  }
  const newUser = new User({
    fullname: req.body.fullname,
    email: req.body.email,
    password: hash,
  });

  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//user login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("User Not Found");
    // console.log;

    try {
      if (await argon2.verify(user.password, req.body.password)) {
        console.log("hi");
        const accessToken = jwt.sign(
          {
            id: user._id,
            fullname: user.fullname,
          },
          process.env.SECRET_KEY,
          { expiresIn: "5d" }
        );
        user.token = accessToken;
        await user.save();
        const { password, token, ...info } = user._doc;

        res.status(200).json({ ...info, accessToken });
      } else {
        // password did not match
        console.log("password no match");
      }
    } catch (err) {
      res.status(500).json(err);
      console.log("internal failure");
    }
  } catch (err) {}
});

//user logout
router.post("/logout", verify, async (req, res) => {
  if (req.user.id === req.body.id) {
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { token: "" },
      },
      { new: true }
    );
    res.status(200).json("loggedOut");
  } else {
    res.status(403).json("Unauthorized");
  }
});
module.exports = router;
