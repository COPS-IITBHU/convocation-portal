'use client'
import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Box,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import sntcLogo from '../assets/image.png';
import IITBHULOGO from '../assets/image (1).png';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    branch: '',
    rollNumber: '',
    unhashedPassword: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/home');
    }
  }, [router]);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event: React.MouseEvent) => event.preventDefault();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        Cookies.set('token', data.token, { expires: 7 });
        router.push('/home');
      } else {
        console.error('Registration failed:', data.message);
        setError(data.message);
        setIsToastOpen(true);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Something went wrong. Please try again later.');
      setIsToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      {isToastOpen && <Alert variant="filled" severity="error">
        {error}
      </Alert>}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '800px',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '60%',
          }}
        >
          <Image
            src={sntcLogo}
            alt="SNTC Logo"
            width={400}
            height={100}
            style={{ 
              objectFit: 'contain',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Box>
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            justifyContent: 'flex-start',
            width: '40%',
          }}
        >
          <Image
            src={IITBHULOGO}
            alt="IIT BHU Logo"
            width={120}
            height={120}
            style={{ 
              objectFit: 'contain',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="h3"
        sx={{
          marginBottom: '2rem',
          color: '#1a237e',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        Welcomes you to Convocation 2024 !
      </Typography>

      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: '450px',
          padding: '2rem',
          borderRadius: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#1a237e',
            fontWeight: '500',
          }}
        >
          Register
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ marginBottom: '1rem' }}
          />

          <TextField
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ marginBottom: '1rem' }}
          />

          <FormControl fullWidth sx={{ marginBottom: '1rem' }} required>
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select
              labelId="branch-label"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="Computer Science and Engineering">Computer Science</MenuItem>
              <MenuItem value="Electronics Engineering">Electronics</MenuItem>
              <MenuItem value="Mechanical Engineering">Mechanical</MenuItem>
              <MenuItem value="Civil Engineering">Civil</MenuItem>
              <MenuItem value="Mathematics and Computing">Maths and Computing</MenuItem>
              <MenuItem value="Electrical Engineering">Electrical</MenuItem>
              <MenuItem value="Chemical Engineering">Chemical</MenuItem>
              <MenuItem value="Metallurgical Engineering">Metallurgy</MenuItem>
              <MenuItem value="Mining Engineering">Mining</MenuItem>
              <MenuItem value="Ceramic Engineering">Ceramic</MenuItem>
              <MenuItem value="Biomedical Engineering">Biomedical</MenuItem>
              <MenuItem value="Biochemical Engineering">Biochemical</MenuItem>
              <MenuItem value="Engineering Physics">Engineering Physics</MenuItem>
              <MenuItem value="Pharmaceutical Engineering">Pharmaceutical Engineering</MenuItem>
              <MenuItem value="School of Material Sciences and Technology">School of Material Sciences and Technology</MenuItem>
              <MenuItem value="Architecture Planning and Design">Architecture Planning and Design</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Roll Number"
            type="number"
            fullWidth
            variant="outlined"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
            sx={{ marginBottom: '1rem' }}
          />

          <FormControl fullWidth sx={{ marginBottom: '1.5rem' }} variant="outlined">
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              name="unhashedPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.unhashedPassword}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              required
            />
          </FormControl>

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            type="submit"
            disabled={isLoading}
            sx={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#303f9f',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>

          <Typography sx={{ textAlign: 'center', color: '#666' }}>
            Already have an account?{' '}
            <a 
              href="/" 
              style={{
                color: '#1a237e',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Sign In
            </a>
          </Typography>
          {/* <br></br> */}
          <Typography sx={{ textAlign: 'left', color: '#666', marginTop: '1rem' }}>
            Instructions :
            </Typography>
            <Typography sx={{ textAlign: 'left', color: '#000', fontWeight: '300', fontSize: '0.75rem' }}>
                <ul className={"list-disc list-outside"}>
                <li> Please SignUp and fill your details for the first time. Kindly use your institute email id for registration.</li>
                <li> Last Date to fill the details for accommodation is 21st October 2024 till 5 PM.</li>
                <li> Accommodation is available from 26th-29th October, 2024 on a chargeable basis. The charges are Rs. 250/bed for Hostel Rooms and 150/bed for Common Rooms.</li>
                <li> As limited hostel rooms are available, accommodation will be provided on a first come first serve basis.</li>
                </ul>
            </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              marginTop:'2rem',
              marginBottom: '0.5rem',
              width: '100%',
              maxWidth: '800px',
            }}
          >
            Made with ❤️ by COPS
          </Box>
        </form>
      </Paper>
    </Box>
  );
}