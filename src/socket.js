const { Server } = require("socket.io");

const Room = require('./models/room.model');
const Client = require('./models/client.model');

const io = {}

io.init = function initSocket(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('new-connection-created', async (roomId, username) => {
            socket.join(roomId)

            try {
                const roomToJoin = await Room.findOne({ url_id: roomId }); 
                
                const newClient = new Client({ 
                    socket_id: socket.id,
                    room_id: roomToJoin._id,
                    username: username
                });
    
                await newClient.save();
            } catch (error) {
                console.log(error);
            }

            //Tell other clients thath a user has connected
            socket.broadcast.to(roomId).emit('new-user-connected', username);
        });

        //Set movie url for all clients
        socket.on('load-movie', (room, url) => socket.broadcast.to(room).emit('set-movie', url));
        socket.on('play', (room) => socket.broadcast.to(room).emit('movie-play'));
        socket.on('pause', (room) => socket.broadcast.to(room).emit('movie-pause'));
    
        //Disconnessione utente
        socket.on("disconnect", async () => {

            const socketId = socket.id;
            
            try {
                const client = await Client.findOne({ socket_id: socketId });
            
                const roomId = client.room_id.toString();
                const username = client.username;

                await client.remove();

                const remainingClients = await Client.find({ room_id: roomId });
                
                const room = await Room.findById(roomId);
                
                if(remainingClients.length === 0) await room.remove(); 
                else socket.broadcast.to(room.url_id).emit('user-disconnected', username);

            } catch (error) {
                console.error(error);
            }

            socket.disconnect();
        });
    });

    return io;
}

module.exports = io;