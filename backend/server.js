const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { locationSchema } = require('./model');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.get('/api/available-rooms', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const availableRooms = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms.filter(room => room.occupants.length < room.capacity)
         };
      });
      res.status(200).json(availableRooms);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch available rooms' });
   }
});

app.post('/api/register',async (req, res) => {
      const {name, branch, rollNumber, email, roomLocation, roomName, meal} = req.body;

      try {
         const location = await locationSchema.findOne({ locationName: roomLocation });
         if (!location) {
            return res.status(400).json({ message: 'Invalid location' });
         }
         const room = location.rooms.find(room => room.roomName === roomName);
         if (!room || room.occupants.length >= room.capacity) {
            return res.status(400).json({ message: 'Room is full or not found' });
         }
         const newAlum = {
            name,
            branch,
            rollNumber,
            email,
            roomLocation,
            roomName,
            meal,
         };

         room.occupants.push(newAlum);
         await location.save();
         res.status(201).json({ message: 'Alum registered successfully' });
      } catch (error) {
         res.status(500).json({ message: 'Could not register alum' });
      }
});

app.post('/api/initializelocations', async (req, res) => {
   try {
      await locationSchema.deleteMany({});
      const predefinedLocations = [
         {
            locationName: 'A',
            rooms: [
               { roomName: 'A101', capacity: 2, occupants: [] },
               { roomName: 'A102', capacity: 2, occupants: [] },
               { roomName: 'A103', capacity: 2, occupants: [] },
            ]
         },
         {
            locationName: 'B',
            rooms: [
               { roomName: 'B101', capacity: 2, occupants: [] },
               { roomName: 'B102', capacity: 2, occupants: [] },
               { roomName: 'B103', capacity: 2, occupants: [] },
            ]
         },
         {
            locationName: 'C',
            rooms: [
               { roomName: 'C101', capacity: 2, occupants: [] },
               { roomName: 'C102', capacity: 2, occupants: [] },
               { roomName: 'C103', capacity: 2, occupants: [] },
            ]
         }
      ];
      await locationSchema.insertMany(predefinedLocations);
      res.status(200).json({ message: 'Locations initialized successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Could not initialize locations' });
   }
});

app.listen(5000, () => {
   console.log('Server running on port 5000');
});
