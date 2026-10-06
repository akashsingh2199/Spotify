const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.LoginUser);
router.post("/logout", authController.logoutUser);
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;