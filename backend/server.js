const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/convocation', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

// Routes
app.post('/api/register', (req, res) => {
   // Logic to save the form data
   res.json({ message: 'Room allocated' });
});

app.listen(5000, () => {
   console.log('Server running on port 5000');
});
