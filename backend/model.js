const mongoose = require('mongoose');

const alumSchema = new mongoose.Schema({
   name: String,
   branch: String,
   rollNumber: String,
   email: String,
   roomLocation: String,
   roomName: String,
   meal: Boolean,
   password: String
});

const roomSchema = new mongoose.Schema({
    roomName: String,
    capacity: Number,
    occupants: [alumSchema],
    location: String,
});

const locationSchema = mongoose.model('Locations', new mongoose.Schema({
    locationName: String,
    rooms: [roomSchema],
}));

const Alum = mongoose.model('Alum' , alumSchema)
const Room = mongoose.model('Room', roomSchema)

module.exports = { alumSchema, roomSchema, locationSchema, Alum, Room };

