import USER from "../models/user.js";
import TOKEN_MODEL from "../models/token.js";
import { sendEmail, verifyEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { setUser } from "../service/auth.js";

async function CreateUser(req, res) {
  try {
    const { name, email, password, confirm_password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Check if email is valid using the verifyEmail function
    const isEmailValid = await verifyEmail(email); // This is the new step
    if (!isEmailValid) {
      return res.status(400).json({ msg: "Invalid email address. Please provide a valid email." });
    }

    // Check if the email already exists in the database
    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Create new user
    const newUser = new USER({
      name,
      email,
      password,
    });

    // Create a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await TOKEN_MODEL.create({ userId: newUser._id, token: verificationToken });

    // Create the verification link
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}&id=${newUser._id}`;

    // Send the verification email
    await sendEmail(
      newUser.email,
      "Verify Your Email",
      `Please verify your email by clicking this link: ${verificationLink}`
    );

    // Redirect to the sign-in page or send success response
    newUser.save();
    res.redirect("/sign_in");
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

async function AccessUser(req, res) {
  try {
    const { email, password } = req.body;
    const ind_user = await USER.findOne({ email, password });

    if (!ind_user) {
      return res.status(400).json({ msg: "Invalid User or Password" });
    }

    const token = setUser(ind_user);
    res.cookie("uid", token);
    res.json({ msg: "User logged in successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server Issue" });
  }
}

const signIn = (req, res) => {
  res.send('Sign in successful');
};

export { CreateUser, AccessUser, verifyEmail };
