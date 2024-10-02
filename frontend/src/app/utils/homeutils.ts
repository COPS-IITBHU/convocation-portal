import { Alumni } from "../types/types";

export const handleUnoccupiedRooms = async () => {
    const unoccupiedrooms = await fetch('https://convocation-portal.onrender.com/api/unoccupied-rooms', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        }
    });
    const unoccupiedroomsdata = await unoccupiedrooms.json();
    return unoccupiedroomsdata;
};

export const handleOccupiedRooms = async () => {
    const occupiedrooms = await fetch('https://convocation-portal.onrender.com/api/occupied-rooms', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        }
    });
    const occupiedroomsdata = await occupiedrooms.json();
    return occupiedroomsdata;
};

export const handlePartiallyOccupiedRooms = async () => {
    const partiallyoccupiedrooms = await fetch('https://convocation-portal.onrender.com/api/partially-occupied-rooms', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        }
    });
    const partiallyoccupiedroomsdata = await partiallyoccupiedrooms.json();
    return partiallyoccupiedroomsdata;
};

export const handleRoomBooking = async (alumDetails: Alumni, roomLocation: string, roomName: string, meal: boolean) => {
    const booking = await fetch('https://convocation-portal.onrender.com/api/register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        name: alumDetails.name,
        branch: alumDetails.branch,
        rollNumber: alumDetails.rollNumber,
        email: alumDetails.email,
        roomLocation: roomLocation,
        roomName: roomName,
        meal: meal,
        }),
    });
    const bookingdata = await booking.json();
    alumDetails.roomLocation = roomLocation;
    alumDetails.roomName = roomName;
    alumDetails.meal = meal;
    return bookingdata;
};