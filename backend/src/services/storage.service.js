const ImageKit = require('@imagekit/nodejs');

const imagekitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadMusicFile(file) {
    try {
        const result = await imagekitClient.files.upload({
            file,
            fileName: "music_" + Date.now(),
            folder: "musics"
        });
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = { uploadMusicFile };
