const jwt = require('jsonwebtoken');
const jwtSecret = 'mysecretkey';

const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Đăng ký tài khoản người dùng
exports.signup = async (req, res, next) => {
    if (!req.body.email || !req.body.password || !req.body.name) {
        return next(new ApiError(400, 'Email, Password and Name are required'));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const existingUser = await userService.findByEmail(req.body.email);
        if (existingUser) {
            return next(new ApiError(400, 'Email is already taken'));
        }
        const user = await userService.create(req.body);
        if(user) {
            return res.send({ message: "Signup successfully" });
        }
       
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while signing up'));
    }
};

// Đăng nhập vào tài khoản người dùng
exports.signin = async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return next(new ApiError(400, 'Email and password are required'));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.login(req.body.email, req.body.password);
        if (!user) {
            return next(new ApiError(401, 'Invalid email or password'));
        }
        const token = jwt.sign({ id: user._id}, jwtSecret, {
            expiresIn: 864000 // 24 giờ
        })
        return res.send({ message: "Signin successfully", token: token });
        
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while signing in'));
    }
};

  




  