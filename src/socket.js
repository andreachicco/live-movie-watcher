const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const { roomCollection, clientCollection } = require('./mongoose');

const parseData = (payload) => JSON.parse(payload);
const createToken = (payload) => jwt.sign(payload, process.env.TOKEN_SECRET);

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
                
                const { socket_id } = await clientCollection.createClient({ 
                    socket_id: socket.id,
                    room_id: roomToJoin._id,
                    username: username
                });

                const token = createToken({ socket_id, room_id: roomToJoin.url_id, username });

                const data = {
                    token,
                    currentVideo: roomToJoin.current_video
                };
                //Tell to the client that is connecting that the connection has been created
                socket.emit('connection-established', JSON.stringify(data));

                //Tell other clients that a user has connected
                socket.to(roomId).emit('new-user-connected', username);
            } catch (error) {
                console.error(error);
            }
        });

        //Set movie url for all clients
        socket.on('load-movie', async (payload) => {
            
            const jsonData = parseData(payload);
            const { roomId: urlId, videoUrl } = jsonData;

            try { await roomCollection.setCurrentVideo(urlId, videoUrl); }
            catch (error) { console.error(error) }

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