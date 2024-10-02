const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { locationSchema, Room, Alum } = require('./model');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { authRouter } = require('./auth');
const cors = require('cors')

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use('/api/auth/', authRouter)


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
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

app.post('/api/register', async (req, res) => {
   const { name, branch, rollNumber, email, roomLocation, roomName, meal } = req.body;
 
   try {
     // Check if an alum with the same roll number or email already exists
     const existingAlum = await Alum.findOne({ $or: [{ rollNumber }, { email }] });
     if (existingAlum) {
       return res.status(409).json({ message: 'Alum already registered with the same roll number or email.' });
     }
 
     // Validate location
     const location = await locationSchema.findOne({ locationName: roomLocation });
     if (!location) {
       return res.status(400).json({ message: 'Invalid location.' });
     }
 
     // Validate room
     const room = location.rooms.find(room => room.roomName === roomName);
     if (!room) {
       return res.status(400).json({ message: 'Room not found.' });
     }
 
     // Check if the room is full
     if (room.occupants.length >= room.capacity) {
       return res.status(400).json({ message: 'Room is full.' });
     }
 
     // Prepare new alum object
     const newAlum = {
       name,
       branch,
       rollNumber,
       email,
       roomLocation,
       roomName,
       meal,
     };
 
     // Insert the new alum
     await Alum.create(newAlum);
 
     // Add the alum to room occupants
     room.occupants.push(newAlum);
     await location.save();
 
     // Send room allocation email
     sendRoomAllocationEmail(email, name, roomLocation, roomName);
 
     // Send success response
     return res.status(201).json({ message: 'Alum registered successfully and email sent.' });
 
   } catch (error) {
     console.error('Error registering alum:', error);
     return res.status(500).json({ message: 'Server error. Could not register alum.' });
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

// Routes
app.get('/api/available-rooms', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const availableRooms = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms
               .filter(room => room.occupants.length < room.capacity)
               .map(room => ({
                  _id: room._id,      // Include the room ID
                  roomName: room.roomName,
                  capacity: room.capacity,
                  occupants: room.occupants
               }))
         };
      });
      res.status(200).json(availableRooms);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch available rooms' });
   }
});

app.get('/api/unoccupied-rooms', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const unoccupiedRooms = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms
               .filter(room => room.occupants.length === 0)
               .map(room => ({
                  _id: room._id,      // Include the room ID
                  roomName: room.roomName,
                  capacity: room.capacity,
                  occupants: room.occupants
               }))
         };
      });
      res.status(200).json(unoccupiedRooms);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch unoccupied rooms' });
   }
});

app.get('/api/occupied-rooms', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const occupiedRooms = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms
               .filter(room => room.occupants.length === room.capacity)
               .map(room => ({
                  _id: room._id,      // Include the room ID
                  roomName: room.roomName,
                  capacity: room.capacity,
                  occupants: room.occupants
               }))
         };
      });
      res.status(200).json(occupiedRooms);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch occupied rooms' });
   }
});

app.get('/api/partially-occupied-rooms', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const partiallyOccupiedRooms = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms
               .filter(room => room.occupants.length > 0 && room.occupants.length < room.capacity)
               .map(room => ({
                  _id: room._id,
                  roomName: room.roomName,
                  capacity: room.capacity,
                  occupants: room.occupants
               }))
         };
      });
      res.status(200).json(partiallyOccupiedRooms);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch partially occupied rooms' });
   }
});


app.get('/api/getinfo/:id', async (req, res) => {
   try {
       const roomId = req.params.id;

       const locations = await locationSchema.find();
         for(const location of locations){
            for(const room of location.rooms){
               // console.log(room._id.toString())

               if(roomId === room._id.toString()){
                  // console.log('FOUND!!!!!!!')
               }
            }
         }

       for (const location of locations) {
           for (const room of location.rooms) {
               if (room._id.toString() === roomId) {
                   return res.status(200).json({
                       numberOfOccupants: room.occupants.length,
                       roomCapacity: room.capacity,
                       roomName: room.roomName,
                       roomLocation: location.locationName
                   });
               }
           }
       }

       return res.status(404).json({ error: 'Room not found' });

   } catch (error) {
       console.error('Error fetching room info:', error);
       return res.status(500).json({ error: error.message });
   }
});

app.post('/alum-room-info', async (req, res) => {
   const { name, branch, rollNumber, email } = req.body;
 
   try {
     // Find alum matching all four fields
     const alum = await Alum.findOne({ name, branch, rollNumber, email });
 
     // If no alum is found, return 404
     if (!alum) {
       return res.status(404).json({ message: 'Alum not found with the provided details.' });
     }
 
     // If alum is found, return the alum details
     return res.status(200).json(alum);
     
   } catch (error) {
     console.error('Error fetching alum info:', error);
     return res.status(500).json({ message: 'Server error. Could not retrieve alum information.' });
   }
 });
 


const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
   },
});

const sendRoomAllocationEmail = async (email, name, roomLocation, roomName) => {
   const mailOptions = {
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Room Allocation Confirmation',
      html: `<p>Your room allocation details are:</p>
               <p>Name: ${name}</p> 
               <p>Location: ${roomLocation}</p>
               <p>Room: ${roomName}</p>
               <p>Thank you for registering with us!</p>`
   };
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.log(error);
      } else {
         console.log('Email sent: ' + info.response);
      }
   });
};

app.listen(5000, () => {
   console.log('Server running on port 5000');
});
