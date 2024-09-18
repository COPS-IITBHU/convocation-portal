'use client'
import React, {useState} from "react";
import {
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';

export default function Home() {

  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    rollNo: '',
    rooms: {},
    messFood: false,
  });

  const [availableRooms, setAvailableRooms] = useState([
    { room: '101', available: true },
    { room: '102', available: false },
    { room: '103', available: true },
  ]);

  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (room: string) => {
    setFormData({
      ...formData,
      rooms: {
        ...formData.rooms,
        [room]: !formData.rooms[room],
      },
    });
  };

  const handleSubmit = (e : any) => {
    e.preventDefault();
    // Here, you can handle the form submission, like sending the data to the server
    console.log(formData);
  };

  return (
    <div className= "">
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Hostel Allotment Form
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <TextField
          label="Name"
          name="name"
          fullWidth
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        {/* Branch Dropdown */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="branch-label">Branch</InputLabel>
          <Select
            labelId="branch-label"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
          >
            <MenuItem value="CSE">Computer Science</MenuItem>
            <MenuItem value="ECE">Electronics</MenuItem>
            <MenuItem value="ME">Mechanical</MenuItem>
            <MenuItem value="CE">Civil</MenuItem>
          </Select>
        </FormControl>

        {/* Roll No Field */}
        <TextField
          label="Roll Number"
          name="rollNo"
          fullWidth
          value={formData.rollNo}
          onChange={handleChange}
          margin="normal"
          required
        />

        {/* Available Rooms (Checkboxes) */}
        <FormGroup>
          <Typography variant="h6" gutterBottom>
            Available Rooms
          </Typography>
          {availableRooms.map((room) => (
            <FormControlLabel
              key={room.room}
              control={
                <Checkbox
                  checked={formData.rooms[room.room] || false}
                  onChange={() => handleRoomChange(room.room)}
                  disabled={!room.available}
                />
              }
              label={`Room ${room.room} ${!room.available ? '(Unavailable)' : ''}`}
            />
          ))}
        </FormGroup>

        {/* Mess Food Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.messFood}
              onChange={(e) => setFormData({ ...formData, messFood: e.target.checked })}
              name="messFood"
            />
          }
          label="Avail Mess Food"
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Submit
        </Button>
      </form>
    </Container>
    </div>
  );
}
