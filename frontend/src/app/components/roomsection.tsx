'use client'
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronRight } from "lucide-react";
import { RoomInfo, Alumni } from '../types/types';

export default function RoomSection({ title, roomsInfo, alumni }: { title: string; roomsInfo: RoomInfo[], alumni: Alumni }) {
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
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} className="text-black">{info.location}</Typography>
                <List dense>
                  {info.rooms.map((room, roomIndex) => (
                    <ListItem key={roomIndex} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
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
      </Box>
    );
  };
  