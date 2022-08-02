const mongoose = require('mongoose');

const { Schema } = mongoose;

const clientSchema = new Schema({
    socket_id: String,
    room_id: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    user_id: String
});

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;