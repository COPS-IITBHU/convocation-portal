'use client'
import React, { useEffect, useState } from 'react';
import {
  Container,
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
  Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';  // Correct import for Next.js App Router

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    branch: '',
    rollNumber: '',
    unhashedPassword: '',
  });
  const router = useRouter();  // Using the App Router's `useRouter`

  useEffect(() => {
    // Check if the token exists in the cookies
    const token = Cookies.get('token');
    if (token) {
      // If token exists, redirect to /home
      router.push('/home');
    }
  }, [router]);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;

        // Set the token in cookies with a 7-day expiry
        Cookies.set('token', token, { expires: 7 });

        // Redirect to /home upon successful registration
        router.push('/home');
      } else {
        console.error('Registration failed:', data.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'gray', // Set gray background color
        minHeight: '100vh',      // Ensure the background covers the full height of the viewport
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          backgroundColor: 'white', // White background for the form container
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" className="text-center mb-6 text-black">
          Register
        </Typography>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <TextField
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Branch Dropdown */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select
              labelId="branch-label"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="CSE">Computer Science</MenuItem>
              <MenuItem value="ECE">Electronics</MenuItem>
              <MenuItem value="ME">Mechanical</MenuItem>
              <MenuItem value="CE">Civil</MenuItem>
            </Select>
          </FormControl>

          <div className="mb-4">
            <TextField
              label="Roll Number"
              type="number"
              fullWidth
              variant="outlined"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <FormControl fullWidth variant="outlined">
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
          </div>

          <div className="mb-4 flex items-center justify-between">
            <Button variant="contained" color="primary" fullWidth type="submit">
              Sign Up
            </Button>
          </div>

          <Typography className="text-center mt-4 text-black">
            Already have an account? <a href="/" className="text-blue-500">Sign In</a>
          </Typography>
        </form>
      </Container>
    </Box>
  );
}
