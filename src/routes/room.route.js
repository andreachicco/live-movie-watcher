const expres = require('express');
const short = require('short-uuid');
const router = expres.Router();

const Room = require('../models/room.model');
const Client = require('../models/client.model');

router.post('/', async (req, res) => {
    const newRoomId = short.generate();

    const room = new Room({ url_id: newRoomId });
    await room.save();

    res.redirect(`/room/${newRoomId}`);
});

router.get('/join', (req, res) => {
    res.render('join', { title: 'Join Room'});
})

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

router.get('/:id/clients', async (req, res) => {

    const { id: roomId } = req.params;

    const room = await Room.findOne({ url_id: roomId });

    const clients = await Client.find({ room_id: room._id });
    const clientNames = clients.map(client => client.username);
    
    res.json(clientNames);
});

module.exports = router;