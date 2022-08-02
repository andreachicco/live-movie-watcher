const { Server } = require("socket.io");

const Room = require('./models/room.model');

const io = {}

io.init = function initSocket(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('newUser', async (room) => {
            socket.join(room)

            const roomToJoin = await Room.findOne({ url_id: room }); 

            if(!roomToJoin.owner_id) roomToJoin.owner_id = socket.id;

            await roomToJoin.save();
        });

        //Set movie url for all clients
        socket.on('loadMovie', (room, url) => socket.broadcast.to(room).emit('setMovie', url));
        socket.on('play', (room) => socket.broadcast.to(room).emit('moviePlay'));
        socket.on('pause', (room) => socket.broadcast.to(room).emit('moviePause'));
    
        //Disconnessione utente
        socket.on("disconnect", async () => {

            const socketId = socket.id;
            
            try {
                const isOwnerOfAnyRoom = await Room.findOne({ owner_id: socketId });
    
                if(isOwnerOfAnyRoom) {
                    io.to(isOwnerOfAnyRoom.url_id).emit('closeRoom');
                    await isOwnerOfAnyRoom.remove();
                }
            } catch (error) {
                console.error(error);
            }

            socket.disconnect();
        });
    });

    return io;
}

module.exports = io;