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
    Switch,
    Snackbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';
import { RoomInfo, Alumni, Room } from '../types/types';
import { getRoomDetails, handleImage } from '../utils/roomutils';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';

const RoomSection = ({ title, roomsInfo }: { title: string; roomsInfo: RoomInfo[] }) => {
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
    const [base64String, setBase64String] = useState<string>("")
    const [open, setOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [details, setDetails] = useState<{ numberOfOccupants: number; roomCapacity: number; roomLocation: string; roomName: string; meal: boolean; } | null>(null);
    const [isMess, setIsMess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);

    const handleClickOpen = async (room: Room) => {
        setSelectedRoom(room);
        setOpen(true);

        try {
            const roomDetails = await getRoomDetails(room._id);
            if (roomDetails) {
                setDetails(roomDetails);
            } else {
                console.error("Failed to fetch room details.");
                setDetails(null);
            }
        } catch (error) {
            console.error("Error fetching room details:", error);
            setDetails(null);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRoom(null);
        setDetails(null); 
        setIsMess(false); 
        setSelectedImage(null);
        setImageError(null);
    };

    const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsMess(event.target.checked);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileType = file.type;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
            if (!allowedTypes.includes(fileType)) {
                setImageError("Only .png, .jpeg, and .jpg files are allowed.");
                setSelectedImage(null);
            } else {
                setImageError(null);
                setSelectedImage(file);
    
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64String(base64String)
                    console.log('Base64 Image String:', base64String);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleBookRoom = async () => {
        if (selectedRoom && details) {
            if (!selectedImage) {
                setImageError("Please upload an image before booking.");
                return;
            }

            try {
                const bookingResponse = await handleImage(alumDetails, details.roomLocation, details.roomName, isMess, base64String);

                if (!bookingResponse) {
                    setError("You can only book one room at a time.");
                    setIsToastOpen(true);
                } else {
                    handleClose(); // Close the dialog after successful booking
                    setIsSuccessToastOpen(true); // Show success toast
                    setTimeout(() => {
                        router.push('/home');
                    }, 3000); // Redirect after 3 seconds
                    return;
                }
            } catch (error) {
                console.error("Error during room booking:", error);
                setError("Failed to book the room. Please try again.");
                setIsToastOpen(true);
            }
        }
    };

    const handleCloseToast = () => {
        setIsToastOpen(false);
        setError(null);
        setImageError(null);
    };

    const handleCloseSuccessToast = () => {
        setIsSuccessToastOpen(false);
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

                            {/* Image Upload Section */}
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Upload an image (only .png, .jpeg, .jpg):
                                </Typography>
                                <input
                                    accept="image/png, image/jpeg, image/jpg"
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ marginTop: '10px' }}
                                />
                                {imageError && (
                                    <Typography color="error" variant="body2" mt={1}>
                                        {imageError}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                    <Button onClick={handleBookRoom} color="primary" disabled={!details || !!imageError}>
                        Book Room
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={isToastOpen}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                message={error || imageError}
            />

            <Snackbar
                open={isSuccessToastOpen}
                autoHideDuration={6000}
                onClose={handleCloseSuccessToast}
                message="Please keep checking your college mail inbox and this site for further updates"
            />
        </Box>
    );
};

export default RoomSection;