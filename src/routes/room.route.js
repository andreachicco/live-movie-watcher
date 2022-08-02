const expres = require('express');
const short = require('short-uuid');
const router = expres.Router();

const Room = require('../models/room.model');

router.post('/', async (req, res) => {
    const newRoomId = short.generate();

    const room = new Room({ url_id: newRoomId });
    await room.save();

    res.redirect(`/room/${newRoomId}`);
});

router.post('/join', (req, res) => {
    const { roomId } = req.body;
    res.redirect(`/room/${roomId}`);
});
  
router.get('/:id', async (req, res) => {

    const { id: roomId } = req.params;

    const room = await Room.findOne({ url_id: roomId });
    
    if(!room) return res.redirect('/');

    res.render('room', { title: `Room | ${roomId}`, roomId: roomId });
});

module.exports = router;