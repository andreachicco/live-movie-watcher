const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomSchema = new Schema({
    url_id: {
        required: true,
        type: String,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    current_video: {
        type: String,
        default: '/assets/videos/default.mp4'
    }
});

const roomModel = mongoose.model('Room', roomSchema);

module.exports = roomModel;