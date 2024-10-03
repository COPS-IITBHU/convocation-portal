const mongoose = require('mongoose');

const alumSchema = new mongoose.Schema({
   name: String,
   branch: String,
   rollNumber: String,
   email: String,
   roomLocation: String,
   roomName: String,
   meal: Boolean
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    branch: String,
    rollNumber: String,
    password: String,
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
const User = mongoose.model('User', userSchema)

module.exports = { alumSchema, roomSchema, locationSchema, Alum, Room, User };

