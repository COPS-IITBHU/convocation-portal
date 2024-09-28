const mongoose = require('mongoose');

const alumSchema = new mongoose.Schema({
   name: String,
   branch: String,
   rollNumber: String,
   roomLocation: String,
   roomName: String,
   meal: Boolean,
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

module.exports = { alumSchema, roomSchema, locationSchema };

