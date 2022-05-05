const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullname: { type: String },
    email: { type: String },
    password: { type: String, minlength: 8 },
    token: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
