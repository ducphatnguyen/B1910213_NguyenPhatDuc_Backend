const jwt = require("jsonwebtoken");
const jwtSecret = "mysecretkey";

const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Đăng ký tài khoản người dùng
exports.signUp = async (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    return next(new ApiError(400, "Email, Password and Name are required"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    const existingUser = await userService.findByEmail(req.body.email);
    if (existingUser) {
      return next(new ApiError(400, "Email is already taken"));
    }
    const user = await userService.signUp(req.body);
    if (user) {
      return res.send({ message: "Signup successfully" });
    }
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "An error occurred while signing up"));
  }
};

// Đăng nhập vào tài khoản người dùng
exports.signIn = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.signIn(req.body.email, req.body.password);
    if (!user) {
      return next(new ApiError(401, "Invalid email or password"));
    }
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: 864000, // 24 giờ
    });

    //Thêm token vào CSDL
    await userService.addToken(user._id, token);

    // Gửi về client để client lưu trữ và client sẽ dùng token này cho mỗi lần request tới server và server sẽ xác thực
    res.setHeader("Authorization", "Bearer " + token);
    return res.send({ message: "Signin successfully", token: token });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "An error occurred while signing in"));
  }
};

// Đăng xuất khỏi tài khoản người dùng
exports.signOut = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const userService = new UserService(MongoDB.client);
    //Xóa token trong CSDL
    await userService.deleteToken(decodedToken.id, token);

    return res.send({ message: "Signout successfully" });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "An error occurred while signing out"));
  }
};
