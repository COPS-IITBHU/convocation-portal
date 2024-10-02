'use client';
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useMediaQuery,
    Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';
import { RoomInfo, Alumni, Room } from '../types/types';
import { getRoomDetails, handleRoomBooking } from '../utils/roomutils';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';

const RoomSection = ({ title, roomsInfo, alumni }: { title: string; roomsInfo: RoomInfo[]; alumni: Alumni }) => {
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

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [details, setDetails] = useState<{ numberOfOccupants: number; roomCapacity: number; roomLocation: string; roomName: string; meal: boolean; } | null>(null);
    const [isMess, setIsMess] = useState(false);

    const handleClickOpen = async (room: Room) => {
        setSelectedRoom(room);
        setOpen(true);
    
        const roomDetails = await getRoomDetails(room._id);
    
        if (roomDetails) {
            setDetails(roomDetails);
        } else {
            console.error("Failed to fetch room details.");
            setDetails(null);
        }
    };
    
    const handleClose = () => {
        setOpen(false);
        setSelectedRoom(null);
        setDetails(null); 
        setIsMess(false); 
    };

    const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsMess(event.target.checked);
    };

    const handleBookRoom = async () => {
        if (selectedRoom && details) {
            await handleRoomBooking(alumDetails, details.roomLocation, details.roomName, isMess);
            handleClose(); // Optionally close the dialog after booking
        }
    };

    useEffect(() => {
        if (token) {
            const userdetails = jwtDecode<{ name: string; branch: string; rollNumber: string; email: string }>(token);
            setAlumDetails((prev) => ({
                ...prev,
                name: userdetails.name,
                branch: userdetails.branch,
                rollNumber: userdetails.rollNumber,
                email: userdetails.email,
            }));
        } else {
            router.push('/');
        }
    }, [token, router]);

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ borderBottom: `2px solid ${theme.palette.primary.main}`, pb: 1, mb: 2 }} className="text-black">
                {title}
            </Typography>
            <Grid container spacing={2}>
                {roomsInfo.map((info, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} className="text-black">{info.location}</Typography>
                            <List dense>
                                {info.rooms.map((room, roomIndex) => (
                                    <ListItem
                                        key={roomIndex}
                                        sx={{ '&:hover': { bgcolor: theme.palette.action.hover }, cursor: 'pointer' }}
                                        onClick={() => handleClickOpen(room)}
                                    >
                                        <ListItemIcon>
                                            <ChevronRight size={20} />
                                        </ListItemIcon>
                                        <ListItemText primary={room.roomName} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedRoom?.roomName}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedRoom?.roomDetails}
                    </Typography>
                    {details && (
                        <Box mt={2}>
                            <Typography variant="body1" color="text.secondary">
                                Number of Occupants: <strong>{details.numberOfOccupants}</strong>
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Room Capacity: <strong>{details.roomCapacity}</strong>
                            </Typography>
                            <Box display="flex" alignItems="center" mt={2}>
                                <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                                    {isMess ? "Mess" : "No Mess"}
                                </Typography>
                                <Switch
                                    checked={isMess}
                                    onChange={handleToggleChange}
                                    color="primary"
                                    inputProps={{ 'aria-label': 'toggle mess preference' }}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                    <Button onClick={handleBookRoom} color="primary" disabled={!details}>
                        Book Room
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RoomSection;
