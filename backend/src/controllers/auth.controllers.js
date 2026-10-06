const UserModel = require("../model/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

async function registerUser(req, res) {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email, and password are required"
            });
        }

        const isUserExist = await UserModel.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (isUserExist) {
            return res.status(409).json({
                success: false,
                message: "User with this email or username already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hash,
            role: role || "user"
        });

        const token = JWT.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
}

async function LoginUser(req, res) {
    try {
        const { email, password, username } = req.body;

        if ((!email && !username) || !password) {
            return res.status(400).json({
                success: false,
                message: "Username/email and password are required"
            });
        }

        const identifier = email ? { email: email.toLowerCase() } : { username };
        const user = await UserModel.findOne(identifier);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = JWT.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

async function getMe(req, res) {
    try {
        const user = await UserModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
}

module.exports = {
    registerUser,
    LoginUser,
    logoutUser,
    getMe
};