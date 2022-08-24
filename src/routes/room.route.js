const expres = require('express');
const short = require('short-uuid');
const router = expres.Router();

const { verifyToken } = require('../middlewares');
const { roomCollection, clientCollection } = require('../mongoose');

//Create new room
router.post('/', async (req, res) => {
    const newRoomId = short.generate();
    await roomCollection.createRoom(newRoomId);

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

    const room = await roomCollection.findOneByUrlId(roomId);
    
    if(!room) return res.statusCode(404).redirect('/');

    res.render('room', { title: `Room | ${roomId}`, roomId: roomId });
});

router.get('/:id/clients', verifyToken, async (req, res) => {
    
    const { id: roomId } = req.params;
    
    try {
        const room = await roomCollection.findOneByUrlId(roomId);
    
        const clients = await clientCollection.findByField('room_id', room._id);
        const clientNames = clients.map(client => client.username);
        
        res.json(clientNames);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }

});

module.exports = router;