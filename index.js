import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./database/database.connection.js";
import { User } from "./database/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "./middleware/authentication.middleware.js";

dotenv.config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port: ", port);
});

app.post("/register", async (req, res) => {
  const { username, email, password, mobile } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        status: "failure",
        message: "User Already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashPassword,
      mobile,
    });

    await user.save();

    // Return success message
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  let user;
  if (req.body.email && req.body.password) {
    const { email, password } = req.body;
    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found please register",
      });
    }

    console.log("User<:> ", user);

    const hashPassword = await bcrypt.compare(password, user.password);

    console.log({ hashPassword });

    if (hashPassword && user) {
      const secretKey = process.env.JWT_SECRET;
      console.log({ secretKey });

      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: "1h",
      });
      return res.status(202).json({
        status: "Success",
        message: "User login successfully",
        data: user,
        token: token,
      });
    } else {
      function generateOTP() {
        return Math.floor(1000 + Math.random() * 9000);
      }

      const otp = generateOTP();

      await User.findOneAndUpdate({ email }, { $set: { otp: otp } });

      return res.status(401).json({
        status: "Failed",
        message: `Password does not match. An OTP has been sent to your email: ${email}.`,
      });
    }
  }

  if (req.body.email && req.body.otp) {
    console.log("Inside the otp block");

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found. Please register.",
      });
    }

    console.log({ user });

    if (user.otp === otp) {
      const secretKey = process.env.JWT_SECRET;
      console.log({ secretKey });

      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: "5m",
      });
      return res.status(200).json({
        status: "Success",
        message: `OTP ${otp} matched successfully`,
        token: token,
      });
    } else {
      return res.status(409).json({
        staus: "Failed",
        message: "OTP is either expired or does not match",
      });
    }
  }

  return res.status(400).json({
    status: "Fail",
    message: "Please provide valid email, password, or OTP.",
  });
});

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({
    status: "Success",
    message: "Access granted to protected resource",
    user: req.user, // User information from the token
  });
});
