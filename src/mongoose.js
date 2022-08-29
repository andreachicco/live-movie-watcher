const mongoose = require('mongoose');

class Database {
    connectDatabase(dbUri) {
        mongoose.connect(dbUri, (err) => {
            if(err) console.error(err);
            else console.log('Database connected');
        });
    }
}

class Room extends Database {
    constructor() {
        super();
        this.Room = require('./models/room.model');
    }

    async createRoom(urlId) {
        const room = new this.Room({ url_id: urlId });
        await room.save();
    }

    async deleteRoom(room) {
        await room.remove();
    }

    async setCurrentVideo(urlId, videoUrl) {
        await this.Room.updateOne({ url_id: urlId }, { current_video: videoUrl });
    }

    async findById(roomId) {
        const room = await this.Room.findById(roomId);
        return room;
    }

    async findOneByUrlId(urlId) {
        const room = await this.Room.findOne({ url_id: urlId });
        return room;
    }
}

class Client extends Database {
    constructor() {
        super();
        this.Client = require('./models/client.model');
    }

    async createClient(client) {
        const newClient = new this.Client(client);
        await newClient.save();
        return newClient;
    }

    async deleteClient(client) {
        await client.remove();
    }

    async findByField(key, value) {
        const clients = await this.Client.find({ [key]: value });
        return clients;
    }

    async findOneBySocketId(socketId) {
        const client = await this.Client.findOne({ socket_id: socketId });
        return client;
    }
}

const database = new Database();
Object.freeze(database);

const roomCollection = new Room();
Object.freeze(roomCollection);

const clientCollection = new Client();
Object.freeze(clientCollection);

module.exports = {
    database, 
    roomCollection,
    clientCollection
};