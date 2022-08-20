const { Server } = require("socket.io");
const { roomCollection, clientCollection } = require('./mongoose');

const parseData = (payload) => JSON.parse(payload);

const io = {}

io.init = function initSocket(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('join-room', async (payload) => {

            const jsonData = parseData(payload);
            const { roomId, username } = jsonData;

            socket.join(roomId)

            try {
                const roomToJoin = await roomCollection.findOneByUrlId(roomId); 
                
                await clientCollection.createClient({ 
                    socket_id: socket.id,
                    room_id: roomToJoin._id,
                    username: username
                });
            } catch (error) {
                console.error(error);
            }

            //Tell to the client that is connecting that the connection has been created
            socket.emit('connection-established');

            //Tell other clients that a user has connected
            socket.to(roomId).emit('new-user-connected', username);
        });

        //Set movie url for all clients
        socket.on('load-movie', (payload) => {
            
            const jsonData = parseData(payload);
            const { roomId, videoUrl } = jsonData;
            
            socket.broadcast.to(roomId).emit('set-video', videoUrl)
        });
        socket.on('play', (room) => socket.broadcast.to(room).emit('play-video'));
        socket.on('pause', (room) => socket.broadcast.to(room).emit('pause-video'));
    
        //Disconnessione utente
        socket.on("disconnect", async () => {

            const socketId = socket.id;
            
            try {
                const client = await clientCollection.findOneBySocketId(socketId);
            
                const roomId = client.room_id.toString();
                const username = client.username;

                await clientCollection.deleteClient(client);

                const remainingClients = await clientCollection.findByField('room_id', roomId);
                
                const room = await roomCollection.findById(roomId);
                
                if(remainingClients.length === 0) await roomCollection.deleteRoom(room); 
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