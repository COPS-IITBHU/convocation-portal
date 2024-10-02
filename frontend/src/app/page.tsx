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
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Image from 'next/image';
import copsLogo from './assets/COPS_LOGO (1).png';
import sntcLogo from './assets/image.png';
import iitbhulogo from './assets/image (1).png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/home');
    }
  }, [router]);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event: React.MouseEvent) => event.preventDefault();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const loginData = { email, unhashedPassword: password };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        Cookies.set('token', data.token, { expires: 7 });
        router.push('/home');
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      {/* Updated Top Logos Container */}
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
            src={iitbhulogo}
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

      {/* Welcome Text */}
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
        Welcome to Convocation 2024!
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
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: '1.5rem' }}
          />

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: '1.5rem' }}>
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

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            type="submit"
            sx={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#303f9f',
              },
            }}
          >
            Sign In
          </Button>

          <Typography sx={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Don't have an account?{' '}
            <a 
              href="/signup" 
              style={{
                color: '#1a237e',
                textDecoration: 'none',
                fontWeight: '500',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign Up
            </a>
          </Typography>

          {/* COPS Logo at Bottom */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            Made with ❤️ by COPS
          </Box>
        </form>
      </Paper>
    </Box>
  );
}