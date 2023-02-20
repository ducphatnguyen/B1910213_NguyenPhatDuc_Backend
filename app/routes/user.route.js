const express = require("express");
const users = require("../controllers/user.controller");

const router = express.Router();

// Đăng ký tài khoản người dùng
router.route("/signup")
    .post(users.signup);

// Đăng nhập tài khoản người dùng
router.route("/signin")
    .post(users.signin);
    
module.exports = router;
