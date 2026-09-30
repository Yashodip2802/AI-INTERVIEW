import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";

/**
 * @name registerUserController
 * @desc Controller to handle user registration
 * @route POST /api/auth/register
 * @access Public
 */
const registerUserController = async (req, res) => {

    const { username, email, password } = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    const isUserExist = await userModel.findOne({ email });

    if(isUserExist) {
        return res.status(400).json({ message: "Account already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @desc Controller to handle user login, expected to receive email and password in the request body
 * @route POST /api/auth/login
 * @access Public
 */
const loginUserController = async (req, res) => {

    const { email, password } = req.body;

    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @desc Controller to handle user logout by clearing the token cookie
 * @route GET /api/auth/logout
 * @access Public
 */
const logoutUserController = async (req, res) => {
    const token = req.cookies.token;

    if(token) {
        await blacklistModel.create({ token });
    }

    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}


/**
 * @name getMeController
 * @desc Controller to get the currently authenticated user's information
 * @route GET /api/auth/get-me
 * @access Private
 */
const getMeController = async (req, res) => {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");
    res.status(200).json({ user });
}

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}