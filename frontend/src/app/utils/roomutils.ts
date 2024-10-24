import { Alumni } from "../types/types";

export const getRoomDetails = async (_id: string) => {
    const roomInfo = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getinfo/${_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!roomInfo.ok) {
        throw new Error(`Error fetching room details: ${roomInfo.statusText}`);
    }

    const roomInfoParsed = await roomInfo.json();
    
    console.log(roomInfoParsed);
    
    const numberOfOccupants = roomInfoParsed.numberOfOccupants;
    const roomCapacity = roomInfoParsed.roomCapacity;
    const roomName = roomInfoParsed.roomName;
    const roomLocation = roomInfoParsed.roomLocation;
    const meal = false; // Ensure this return includes meal if it's needed.

    return { numberOfOccupants, roomCapacity, roomName, roomLocation, meal };
}

export const handleRoomBooking = async (alumDetails: Alumni, roomLocation: string, roomName: string, meal: boolean): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: alumDetails.name,
                branch: alumDetails.branch,
                rollNumber: alumDetails.rollNumber,
                email: alumDetails.email,
                roomLocation,
                roomName,
                meal,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error booking room: ${response.statusText}`);
        }

        const bookingData = await response.json();
        alumDetails.roomLocation = roomLocation;
        alumDetails.roomName = roomName;
        alumDetails.meal = meal;

        return bookingData;
    } catch (error) {
        console.error('Error in room booking:', error);
        return null;
    }
};

export const handleImage = async (alumDetails: Alumni, roomLocation: string, roomName: string, meal: boolean, base64String: string): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/image-handling`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: alumDetails.name,
                branch: alumDetails.branch,
                rollNumber: alumDetails.rollNumber,
                email: alumDetails.email,
                roomLocation,
                roomName,
                meal,
                base64String
            }),
        });

        if (!response.ok) {
            throw new Error(`Error booking room: ${response.statusText}`);
        }

        const bookingData = await response.json();
        alumDetails.roomLocation = roomLocation;
        alumDetails.roomName = roomName;
        alumDetails.meal = meal;

        return bookingData;
    } catch (error) {
        console.error('Error in room booking:', error);
        return null;
    }
};