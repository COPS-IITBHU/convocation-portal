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
import Cookies from 'js-cookie'; 
import { useRouter } from 'next/navigation'; 

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

  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  return (
    <div className="">
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Hostel Allotment Form
        </Typography>
        <Button
          onClick={handleLogout}
          variant="outlined"
          color="secondary"
          fullWidth
          className="mt-4"
        >
          Logout
        </Button>
      </Container>
    </div>
  );
}
