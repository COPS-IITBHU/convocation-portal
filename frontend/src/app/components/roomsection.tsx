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
import upi from '../assets/upi.png';
import Image from 'next/image';

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

    // Define max dimensions and quality
    const MAX_WIDTH = 700;
    const MAX_HEIGHT = 700;
    const QUALITY = 0.7;

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const originalReader = new FileReader();
            originalReader.readAsDataURL(file);
            
            originalReader.onload = (originalEvent) => {
                const originalBase64 = originalEvent.target?.result as string;
                
                const reader = new FileReader();
                reader.readAsDataURL(file);
                
                reader.onload = (event) => {
                    const img: HTMLImageElement = document.createElement('img');
                    img.src = event.target?.result as string;
                    
                    img.onload = () => {
                        // Only resize if the image is larger than max dimensions
                        let width = img.width;
                        let height = img.height;
                        let shouldResize = false;
                        
                        if (width > MAX_WIDTH) {
                            height = (MAX_WIDTH * height) / width;
                            width = MAX_WIDTH;
                            shouldResize = true;
                        }
                        if (height > MAX_HEIGHT) {
                            width = (MAX_HEIGHT * width) / height;
                            height = MAX_HEIGHT;
                            shouldResize = true;
                        }
                        
                        if (!shouldResize && file.size < 500000) { // Less than 500KB
                            resolve(originalBase64);
                            return;
                        }
                        
                        const canvas: HTMLCanvasElement = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        
                        if (!ctx) {
                            reject(new Error('Failed to get canvas context'));
                            return;
                        }
                        
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        let outputFormat = file.type;
                        let compressedBase64 = '';
                        let bestQuality = QUALITY;
                        
                        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                            const qualities = [0.8, 0.7, 0.6];
                            for (const q of qualities) {
                                const tempBase64 = canvas.toDataURL(outputFormat, q);
                                if (tempBase64.length < originalBase64.length) {
                                    compressedBase64 = tempBase64;
                                    bestQuality = q;
                                    break;
                                }
                            }
                        } else {
                            // For PNG, just use original quality
                            compressedBase64 = canvas.toDataURL(outputFormat, QUALITY);
                        }
                        
                        // Use the smaller version
                        if (compressedBase64 && compressedBase64.length < originalBase64.length) {
                            resolve(compressedBase64);
                        } else {
                            resolve(originalBase64);
                        }
                    };
                    
                    img.onerror = () => {
                        reject(new Error('Failed to load image'));
                    };
                };
                
                reader.onerror = () => {
                    reject(new Error('Failed to read file'));
                };
            };
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        
        if (file) {
            const fileType = file.type;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            
            if (!allowedTypes.includes(fileType)) {
                setImageError("Only .png, .jpeg, and .jpg files are allowed.");
                setSelectedImage(null);
                setBase64String("");
                return;
            }
            
            try {
                setImageError(null);
                setSelectedImage(file);
                
                // Compress and convert to base64
                const compressedBase64 = await compressImage(file);
                setBase64String(compressedBase64);
                
                // Log size comparison
                const originalSize = file.size;
                const compressedSize = Math.round((compressedBase64.length * 3) / 4);
                console.log('Original size:', Math.round(originalSize / 1024), 'KB');
                console.log('Compressed size:', Math.round(compressedSize / 1024), 'KB');
                console.log('Compression ratio:', Math.round((compressedSize / originalSize) * 100), '%');
                
            } catch (error) {
                setImageError("Error processing image. Please try again.");
                console.error('Error:', error);
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
                    handleClose();
                    setIsSuccessToastOpen(true);
                    setTimeout(() => {
                        router.push('/home');
                    }, 3000);
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
                                    {isMess ? "Mess opted" : "Mess not opted"}
                                </Typography>
                                <Switch
                                    checked={isMess}
                                    onChange={handleToggleChange}
                                    color="primary"
                                    inputProps={{ 'aria-label': 'toggle mess preference' }}
                                />
                            </Box>
                            <Image src={upi} alt="UPI QR Code"/>
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