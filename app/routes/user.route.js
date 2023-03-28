const express = require("express");
const users = require("../controllers/user.controller");

const router = express.Router();

// Đăng ký tài khoản người dùng
router.route("/signup")
    .post(users.signUp);

// Đăng nhập tài khoản người dùng
router.route("/signin")
    .post(users.signIn);

// Đăng xuất tài khoản người dùng
router.route("/signout")
    .post(users.signOut);
    
module.exports = router;
