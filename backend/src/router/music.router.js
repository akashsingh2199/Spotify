const express = require("express");
const router = express.Router();
const multer = require("multer");
const musicController = require("../controllers/music.controller");
const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");

// Configure multer with memory storage and audio file filter
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("audio/") || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed!"), false);
        }
    }
});

// Upload a new song (Protected: Artist only)
router.post("/upload", authMiddleware, requireRole("artist"), upload.single("music"), musicController.uploadMusic);

// Fetch all songs
router.get("/", musicController.getAllMusic);

// Fetch a single song by ID
router.get("/:id", musicController.getMusicById);

// Delete song by ID (Protected route)
router.delete("/:id", authMiddleware, musicController.deleteMusic);

module.exports = router;