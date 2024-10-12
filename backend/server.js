const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { locationSchema, Room, Alum, User } = require('./model');
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

app.get('/api/register', async (req, res) => {
   const name = req.query.name;
   const branch = req.query.branch;
   const rollNumber = req.query.rollNumber;
   const email = req.query.email;
   const roomLocation = req.query.roomLocation;
   const roomName = req.query.roomName;
   const meal = req.query.meal;

 
   try {
     // Check if an alum with the same roll number or email already exists
     const existingAlum = await Alum.findOne({ $or: [{ rollNumber }, { email }] });
     if (existingAlum) {
       return res.status(409).json({ message: 'You have already booked a room.' });
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

   await Alum.create(newAlum);
   console.log('Alum registered successfully:', newAlum);
         
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

app.get('/api/reject', async (req, res) => {
   const email = req.query.email;
   const name = req.query.name;
   const roomLocation = req.query.roomLocation;
   const roomName = req.query.roomName;

   sendRoomARejectionMail(email, name, roomLocation, roomName);
   return res.status(200).json({ message: 'Rejection email sent successfully' });
}
);
 
app.post('/api/initializelocations', async (req, res) => {
   try {
      await locationSchema.deleteMany({});
      const predefinedLocations = [
         {
            locationName: 'Common Rooms (Boys)',
            rooms: [
               { roomName: 'C.V. Raman Hostel', capacity: 40, occupants: [] },
               { roomName: 'Morvi Hostel', capacity: 40, occupants: [] },
               { roomName: 'Dhanrajgiri Hostel', capacity: 64, occupants: [] },
               { roomName: 'Rajputana Hostel', capacity: 40, occupants: [] },
               { roomName: 'Vivekananda Hostel', capacity: 40, occupants: [] },
               { roomName: 'Vishwakarma Hostel', capacity: 40, occupants: [] },
               { roomName: 'Vishweshwaraiya Hostel', capacity: 100, occupants: [] },
               { roomName: 'A.S.N. Bose Hostel', capacity: 24, occupants: [] },
               { roomName: 'Satish Dhawan Hostel', capacity: 100, occupants: [] },
               { roomName: 'P.C. Ray Hostel', capacity: 150, occupants: [] },
            ]
         },
         {
            locationName: 'Normal Rooms (Boys)',
            rooms: [
               { roomName: 'Morvi Hostel', capacity: 200, occupants: [] },
               { roomName: 'Dhanrajgiri Hostel', capacity: 36, occupants: [] },
               { roomName: 'Vivekananda Hostel', capacity: 60, occupants: [] },
               { roomName: 'A.S.N. Bose Hostel', capacity: 36, occupants: [] },
            ]
         },
         {
            locationName: 'Common Rooms (Girls)',
            rooms: [
               { roomName: 'Limbdi Hostel', capacity: 40, occupants: [] },
               { roomName: 'S.C. Dey Hostel', capacity: 40, occupants: [] },
               { roomName: 'G.S.M.C. Hostel', capacity: 100, occupants: [] },
               { roomName: 'Nivedita Hostel', capacity: 100, occupants: [] },
            ]
         },
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
     const alum = await Alum.findOne({ email });
 
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

 app.get('/api/all-rooms-info-to-mail', async (req, res) => {
   try {
      const locations = await locationSchema.find();
      const allRoomsInfo = locations.map(location => {
         return {
            location: location.locationName,
            rooms: location.rooms.map(room => ({
               roomName: room.roomName,
               capacity: room.capacity,
               occupants: room.occupants
            }))
         };
      });
      res.status(200).json(allRoomsInfo);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch all rooms info' });
   }
});

app.get('/api/all-alums', async (req, res) => {
   try {
      const alums = await Alum.find();
      res.status(200).json(alums);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch alums' });
   }
});

app.get('/api/clean-alums', async (req, res) => {
   try {
      await Alum.deleteMany();
      res.status(200).json({ message: 'Alums cleaned successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Could not clean alums' });
   }
});

app.get('/api/all-users', async (req, res) => {
   try {
      const users = await User.find();
      res.status(200).json(users);
   } catch (error) {
      res.status(500).json({ message: 'Could not fetch users' });
   }
});

app.get('/api/clean-users', async (req, res) => {
   try {
      await User.deleteMany();
      res.status(200).json({ message: 'Users cleaned successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Could not clean users' });
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
      html: `
         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
            <h2 style="color: #4CAF50;">Room Allocation Confirmation</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your room allocation details are as follows:</p>
            <ul style="list-style-type: none; padding: 0;">
               <li><strong>Location:</strong> ${roomLocation}</li>
               <li><strong>Room Name:</strong> ${roomName}</li>
            </ul>
            <p>Thank you for registering with us. We look forward to welcoming you!</p>
            <p>Best regards,<br>Your Support Team</p>
         </div>
      `
   };
   console.log('Sending email to:', email);
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.log(error);
      } else {
         console.log('Email sent: ' + info.response);
      }
   });
};

const sendRoomRejectionEmail = async (email, name, roomLocation, roomName) => {
   const mailOptions = {
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Room Allocation Rejection',
      html: `
         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
            <h2 style="color: #F44336;">Room Allocation Rejection</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We regret to inform you that your current request for room allocation has been rejected.</p>
            <ul style="list-style-type: none; padding: 0;">
               <li><strong>Location:</strong> ${roomLocation}</li>
               <li><strong>Room Name:</strong> ${roomName}</li>
            </ul>
            <p>Please reapply with the correct details.</p>
            <p>Best regards,<br>Your Support Team</p>
         </div>
      `
   };
   console.log('Sending email to:', email);
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.log(error);
      } else {
         console.log('Email sent: ' + info.response);
      }
   });
};

const sendMailToAdmin = async (name, roomLocation, roomName, branch, rollNumber, imagePath, meal, email) => {
   const mailOptions = {
      from: 'noreply@yourdomain.com',
      to: 'shivansh111sid@gmail.com',
      subject: 'Room Allocation Confirmation',
      html: `
         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
            <h2 style="color: #4CAF50;">Room Allocation Confirmation</h2>
            <p>Please verify the room details for the following applicant:</p>
            <ul style="list-style-type: none; padding: 0;">
               <li><strong>Name:</strong> ${name}</li>
               <li><strong>Location:</strong> ${roomLocation}</li>
               <li><strong>Room:</strong> ${roomName}</li>
               <li><strong>Branch:</strong> ${branch}</li>
               <li><strong>Roll Number:</strong> ${rollNumber}</li>
               <li><strong>Meal Preference:</strong> ${meal}</li>
            </ul>
            <p>
               <a href="http://localhost:5000/api/register?name=${encodeURIComponent(name)}&branch=${encodeURIComponent(branch)}&rollNumber=${encodeURIComponent(rollNumber)}&roomLocation=${encodeURIComponent(roomLocation)}&roomName=${encodeURIComponent(roomName)}&meal=${encodeURIComponent(meal)}&email=${encodeURIComponent(email)}" 
               style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                  Confirm
               </a>
               <a href="http://localhost:5000/api/reject?name=${encodeURIComponent(name)}&roomLocation=${encodeURIComponent(roomLocation)}&roomName=${encodeURIComponent(roomName)}&email=${encodeURIComponent(email)}" 
               style="display: inline-block; padding: 10px 20px; background-color: #F44336; color: white; text-decoration: none; border-radius: 5px;">
                  Reject
               </a>
            </p>
            <p><img src="cid:screenshot" style="width: 100%; height: auto;" /></p>
         </div>
      `,
      attachments: [{
         filename: 'screenshot.png',
         path: imagePath,
         cid: 'screenshot'
      }]
   };
   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.log(error);
      } else {
         console.log('Email sent: ' + info.response);
      }
   });

   setTimeout(() => {
      fs.unlink(imagePath, (err) => {
         if (err) {
            console.error('Error deleting image:', err);
         } else {
            console.log('Image deleted successfully');
         }
      });
   }, 60000);
};

app.post('/api/image-handling', async (req, res) => {
   const { name, branch, rollNumber, roomLocation, roomName, meal, base64String, email} = req.body;
   
   try {
      if (!base64String) {
         return res.status(400).json({ message: 'No image data provided' });
      }

      const imageBuffer = Buffer.from(base64String.split(",")[1], 'base64'); // Remove the metadata (e.g., "data:image/png;base64,")
      const imageName = `${rollNumber}-${name}.png`; // Generate a unique image name
      const imagePath = path.join(__dirname, 'uploads', imageName); // Define the path where image will be saved
      
      // Ensure the uploads directory exists
      if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
         fs.mkdirSync(path.join(__dirname, 'uploads'));
      }

      // Save the image to the file system
      fs.writeFile(imagePath, imageBuffer, (err) => {
         if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ message: 'Error saving image' });
         }

         // Send a success response
          return res.status(200).json({
            message: 'Alum registered and image saved successfully',
            imagePath: `/uploads/${imageName}`, // Correct the imagePath to be relative
          });
        });
        sendMailToAdmin(name, roomLocation, roomName, branch, rollNumber, path.join(__dirname, 'uploads', imageName), meal, email); // Use absolute path for sending email
      //   console.log(path.join(__dirname, 'uploads', imageName));
   } catch (error) {
      console.error('Error dealing with image:', error);
      return res.status(500).json({ message: 'Server error. Could not register alum.' });
   }
});



app.listen(5000, () => {
   console.log('Server running on port 5000');
});