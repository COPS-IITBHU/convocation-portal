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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'; // Import the router
import Box from '@mui/material/Box';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    // Check if the token exists in the cookies
    const token = Cookies.get('token');
    if (token) {
      // Redirect to /home if token exists
      router.push('/home');
    }
  }, [router]);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the payload for the login request
    const loginData = { email, unhashedPassword: password };

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        Cookies.set('token', data.token, { expires: 7 });
        router.push('/home'); // Redirect to /home on successful login
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'gray', // Set gray background color
        minHeight: '100vh', // Make sure the background covers the full height of the viewport
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
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <FormControl fullWidth variant="outlined">
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Sign In
            </Button>
          </div>

          <Typography className="text-center mt-4 text-black">
            Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
          </Typography>
        </form>
      </Container>
    </Box>
  );
}
