'use client';
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
  Paper,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LogOut, Info } from "lucide-react";
import Cookies from 'js-cookie'; 
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import Image from 'next/image';
import RoomSection from "../components/roomsection";
import { handleOccupiedRooms, handlePartiallyOccupiedRooms, handleUnoccupiedRooms } from "../utils/homeutils";
import { Alumni, RoomInfo } from "../types/types";
import sntcLogo from '../assets/image.png';
import IITBHULOGO from '../assets/image (1).png';

export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unoccupiedroomsdata, setUnoccupiedRoomsData] = useState<RoomInfo[]>([]);
  const [occupiedroomsdata, setOccupiedRoomsData] = useState<RoomInfo[]>([]);
  const [partiallyoccupiedroomsdata, setPartiallyOccupiedRoomsData] = useState<RoomInfo[]>([]);
  const [error, setError] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const token = Cookies.get('token');

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

  const [roomInfo, setRoomInfo] = useState({
    roomName: '',
    roomLocation: '',
    meal: false,
  });

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
    setShowLogoutConfirm(false);
  };

  const getRoomsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const unoccupiedroomsdata = await handleUnoccupiedRooms();
      const occupiedroomsdata = await handleOccupiedRooms();
      const partiallyoccupiedroomsdata = await handlePartiallyOccupiedRooms();
      setUnoccupiedRoomsData(unoccupiedroomsdata);
      setOccupiedRoomsData(occupiedroomsdata);
      setPartiallyOccupiedRoomsData(partiallyoccupiedroomsdata);
    } catch (error) {
      console.error('Error fetching room data:', error);
      setError('Failed to fetch room data. Please try again later.');
      setIsToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAlumData = async () => {
      if (token) {
        try {
          setIsUserDataLoading(true);
          const userdetails = jwtDecode<{
            name: string;
            branch: string;
            rollNumber: string;
            email: string;
          }>(token);
  
          setAlumDetails((prev) => ({
            ...prev,
            name: userdetails.name,
            branch: userdetails.branch,
            rollNumber: userdetails.rollNumber,
            email: userdetails.email,
          }));
  
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/alum-room-info`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: userdetails.name,
                branch: userdetails.branch,
                rollNumber: userdetails.rollNumber,
                email: userdetails.email,
              }),
            }
          );
  
          if (response.status !== 200 && response.status !== 404) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          if (response.status === 200) {
            const alumInfo = await response.json();
            setRoomInfo({
              roomName: alumInfo.roomName,
              roomLocation: alumInfo.roomLocation,
              meal: alumInfo.meal,
            });
          } else if (response.status === 404) {
            // Handle 404 case (e.g., no room booked yet)
            setRoomInfo({
              roomName: '',
              roomLocation: '',
              meal: false,
            });
          }
        } catch (error) {
          console.error('Error fetching alum details or room info:', error);
          setError('Failed to fetch alum details or room info. Please try again later.');
          setIsToastOpen(true);
        } finally {
          setIsUserDataLoading(false);
        }
      } else {
        router.push('/');
      }
    };
  
    fetchAlumData();
    getRoomsData();
  }, [token, router]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        width: '100%',
        padding: '2rem',
      }}
    >
      {isToastOpen && (
        <Alert variant="filled" severity="error" onClose={() => setIsToastOpen(false)}>
          {error}
        </Alert>
      )}
      {/* Top Logos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Header with User Info and Logout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isSmallScreen ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isSmallScreen ? 'flex-start' : 'center', 
            mb: 3,
            gap: 2
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: '#1a237e',
                fontWeight: 'bold',
                fontSize: isSmallScreen ? '1.5rem' : '2.125rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Room Allotment Dashboard
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isSmallScreen ? 'column' : 'row',
              alignItems: isSmallScreen ? 'flex-start' : 'center', 
              gap: 2 
            }}>
              {isUserDataLoading ? (
                <Box>
                  <Skeleton variant="text" width={150} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width={200} />
                </Box>
              ) : (
                <Box textAlign={isSmallScreen ? 'left' : 'right'}>
                  <Typography variant="subtitle1" sx={{ color: '#1a237e', fontWeight: '500' }}>
                    {alumDetails.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#303f9f' }}>
                    {alumDetails.branch}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#303f9f', wordBreak: 'break-word' }}>
                    {alumDetails.email}
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<LogOut />}
                onClick={() => setShowLogoutConfirm(true)}
                sx={{ 
                  height: 'fit-content',
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Current Booking Alert */}
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle>Your Current Booking</AlertTitle>
            {isUserDataLoading ? (
              <Skeleton variant="text" width={300} />
            ) : (
              <Typography>
                {roomInfo.roomLocation} - Room {roomInfo.roomName} {roomInfo.meal ? '(mess included)' : '(mess not included)'}
              </Typography>
            )}
          </Alert>

          {/* Room Sections Wrapped in Boxes */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ mb: 2 }}>
                <RoomSection title="Unoccupied Rooms" roomsInfo={unoccupiedroomsdata} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <RoomSection title="Partially Occupied Rooms" roomsInfo={partiallyoccupiedroomsdata} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <RoomSection title="Occupied Rooms" roomsInfo={occupiedroomsdata} />
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="primary">Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}