'use client'
import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
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
import RoomSection from "../components/roomsection";
import { 
  handleOccupiedRooms,
  handlePartiallyOccupiedRooms, 
  handleUnoccupiedRooms,
  handleRoomBooking } from "../utils/homeutils";
import { Alumni } from "../types/types";


export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unoccupiedroomsdata, setUnoccupiedRoomsData] = useState([]);
  const [occupiedroomsdata, setOccupiedRoomsData] = useState([]);
  const [partiallyoccupiedroomsdata, setPartiallyOccupiedRoomsData] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const token = Cookies.get('token');
  let userdetails = {
    name: '',
    branch: '',
    rollNumber: '',
    email: ''
  };
  const [alumDetails, setAlumDetails] = useState<Alumni>({
    name: '',
    branch: '',
    rollNumber: '',
    email: '',
    roomLocation: '',
    roomName: '',
    meal: false,
    password: ''
  });

  const handleLogout = () => {
    // Remove the token cookie and navigate to the login page
    Cookies.remove('token');
    router.push('/');
    setShowLogoutConfirm(false);
  };

  const getRoomsData = async () => {
    const unoccupiedroomsdata = await handleUnoccupiedRooms();
    const occupiedroomsdata = await handleOccupiedRooms();
    const partiallyoccupiedroomsdata = await handlePartiallyOccupiedRooms();
    setUnoccupiedRoomsData(unoccupiedroomsdata);
    setOccupiedRoomsData(occupiedroomsdata);
    setPartiallyOccupiedRoomsData(partiallyoccupiedroomsdata);
  };

  useEffect(() => {
    getRoomsData();
    setAlumDetails({
      name: userdetails.name,
      branch: userdetails.branch,
      rollNumber: userdetails.rollNumber,
      email: userdetails.email,
      roomLocation: '',
      roomName: '',
      meal: false,
      password: '',
    });
    if (token) {
      userdetails = jwtDecode(token);
      console.log(userdetails);
    }
    if (!token) {
      router.push('/');
    }
  }, []);

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

      {alumDetails.roomName !== '' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Your Current Booking</AlertTitle>
          <Typography>
            You have booked a room in <strong>{alumDetails.roomLocation}</strong> with room name <strong>{alumDetails.roomName}</strong>.
          </Typography>
        </Alert>
      )}

      <RoomSection
        title="Unoccupied Rooms"
        roomsInfo = {unoccupiedroomsdata}
        alumni = {alumDetails}
      />

      <RoomSection
        title="Occupied Rooms"
        roomsInfo={occupiedroomsdata}
        alumni = {alumDetails}
      />

      <RoomSection
        title="Partially Occupied Rooms"
        roomsInfo={partiallyoccupiedroomsdata}
        alumni = {alumDetails}
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
