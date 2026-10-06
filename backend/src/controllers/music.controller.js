const musicModel = require("../model/music.model");
const { uploadMusicFile } = require("../services/storage.service");

async function uploadMusic(req, res) {
    try {
        if (!req.user || req.user.role !== "artist") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only users with the 'artist' role can upload music"
            });
        }

        const { title } = req.body;
        const file = req.file;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Song title is required"
            });
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Music file is required (field name: 'music')"
            });
        }

        const result = await uploadMusicFile(file.buffer.toString("base64"));

        const music = await musicModel.create({
            title: title.trim(),
            artist: req.user.id,
            uri: result.url
        });

        const populatedMusic = await music.populate("artist", "username email role");

        return res.status(201).json({
            success: true,
            message: "Music uploaded successfully",
            music: {
                id: populatedMusic._id,
                title: populatedMusic.title,
                artist: populatedMusic.artist,
                uri: populatedMusic.uri,
                createdAt: populatedMusic.createdAt
            }
        });
    } catch (error) {
        console.error("Upload music error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error during music upload"
        });
    }
}

async function getAllMusic(req, res) {
    try {
        const musics = await musicModel
            .find()
            .populate("artist", "username email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: musics.length,
            musics
        });
    } catch (error) {
        console.error("Get all music error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch music"
        });
    }
}

async function getMusicById(req, res) {
    try {
        const { id } = req.params;
        const music = await musicModel.findById(id).populate("artist", "username email role");

        if (!music) {
            return res.status(404).json({
                success: false,
                message: "Music not found"
            });
        }

        return res.status(200).json({
            success: true,
            music
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch music details"
        });
    }
}

async function deleteMusic(req, res) {
    try {
        const { id } = req.params;
        const music = await musicModel.findById(id);

        if (!music) {
            return res.status(404).json({
                success: false,
                message: "Music not found"
            });
        }

        // Check if user is the owner
        if (music.artist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not the author of this track"
            });
        }

        await musicModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Music deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete music"
        });
    }
}

module.exports = {
    uploadMusic,
    getAllMusic,
    getMusicById,
    deleteMusic
};