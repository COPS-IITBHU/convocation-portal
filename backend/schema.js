const mongoose = require('mongoose');

const alumSchema = new mongoose.Schema({
   name: String,
   branch: String,
   rollNumber: String,
   roomLocation: String,
   roomName: String,
   meal: String,
});

const roomSchema = new mongoose.Schema({
    roomName: String,
    capacity: Number,
    occupants: [alumSchema],
    location: String,
});

const Locations = mongoose.model('Locations', new mongoose.Schema({
    location: String,
    rooms: [roomSchema],
}));

module.exports = mongoose.model('Room', roomSchema);
module.exports = mongoose.model('Alum', alumSchema);
module.exports = mongoose.model('Locations', Locations);

