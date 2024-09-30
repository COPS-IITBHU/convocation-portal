'use client'
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AlertCircle, ChevronRight, LogOut } from "lucide-react";
import Cookies from 'js-cookie'; 
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import local from "next/font/local";

interface RoomInfo {
  hostel: string;
  rooms: string[];
}

const RoomSection = ({ title, roomsInfo }: { title: string; roomsInfo: RoomInfo[] }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ borderBottom: `2px solid ${theme.palette.primary.main}`, pb: 1, mb: 2 }} className="text-black">
        {title}
      </Typography>
      <Grid container spacing={2}>
        {roomsInfo.map((info, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} className="text-black">{info.hostel}</Typography>
              <List dense>
                {info.rooms.map((room, roomIndex) => (
                  <ListItem key={roomIndex} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <ListItemIcon>
                      <ChevronRight size={20} />
                    </ListItemIcon>
                    <ListItemText primary={room} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const handleUnoccupiedRooms = async () => {
  const unoccupiedrooms = await fetch('http://localhost:5000/api/unoccupied-rooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const unoccupiedroomsdata = await unoccupiedrooms.json();
  return unoccupiedroomsdata;
};

const handleOccupiedRooms = async () => {
  const occupiedrooms = await fetch('http://localhost:5000/api/occupied-rooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const occupiedroomsdata = await occupiedrooms.json();
  return occupiedroomsdata;
};

const handlePartiallyOccupiedRooms = async () => {
  const partiallyoccupiedrooms = await fetch('http://localhost:5000/api/partially-occupied-rooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const partiallyoccupiedroomsdata = await partiallyoccupiedrooms.json();
  return partiallyoccupiedroomsdata;
};

export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const token = Cookies.get('token');
  let userdetails = {};

  if (token) {
    userdetails = jwtDecode(token);
    console.log(userdetails);
  }
  if (!token) {
    router.push('/');
  }

  const handleLogout = () => {
    // Remove the token cookie and navigate to the login page
    Cookies.remove('token');
    router.push('/');
    setShowLogoutConfirm(false);
  };

  const unoccupiedroomsdata = handleUnoccupiedRooms();
  const occupiedroomsdata = handleOccupiedRooms();
  const partiallyoccupiedroomsdata = handlePartiallyOccupiedRooms();

  // console.log(unoccupiedroomsdata);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isSmallScreen ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isSmallScreen ? 'flex-start' : 'center', 
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold" className="text-black" sx={{ fontSize: isSmallScreen ? '1.5rem' : '2.125rem' }}>
          Room Allotment Dashboard
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: isSmallScreen ? 'flex-start' : 'center', 
          gap: 2 
        }}>
          <Box textAlign={isSmallScreen ? 'left' : 'right'}>
            <Typography variant="subtitle1" className="text-black">{userdetails.name}</Typography>
            <Typography variant="body2" className="text-black">{userdetails.branch}</Typography>
            <Typography variant="caption" className="text-black" sx={{ wordBreak: 'break-word' }}>
              {userdetails.email}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogOut />}
            onClick={() => setShowLogoutConfirm(true)}
            sx={{ 
              height: 'fit-content',
              transition: 'background-color 0.3s',
              '&:hover': { bgcolor: theme.palette.error.light }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Your Current Booking</AlertTitle>
        Aryabhatta Hostel - Room A109 (mess included)
      </Alert>

      <RoomSection
        title="Unoccupied Rooms"
        roomsInfo={[
          { hostel: "Aryabhatta", rooms: ["43", "A108", "A109", "A110"] },
          { hostel: "Vishveswaraiya", rooms: ["65", "76"] },
          { hostel: "Ramanujan", rooms: ["20", "65"] }
        ]}
      />

      <RoomSection
        title="Occupied Rooms"
        roomsInfo={[
          { hostel: "Aryabhatta", rooms: ["44", "A111", "A112"] },
          { hostel: "Vishveswaraiya", rooms: ["77", "84", "85"] },
          { hostel: "Ramanujan", rooms: ["21", "66", "67"] }
        ]}
      />

      <RoomSection
        title="Partially Occupied Rooms"
        roomsInfo={[
          { hostel: "Aryabhatta", rooms: ["45", "A113"] },
          { hostel: "Vishveswaraiya", rooms: ["78", "86"] },
          { hostel: "Ramanujan", rooms: ["22", "68"] }
        ]}
      />

      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography className="text-black">Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
