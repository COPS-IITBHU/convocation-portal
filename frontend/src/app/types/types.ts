export interface Alumni {
    name: string,
    branch: string,
    rollNumber: string,
    email: string,
    roomLocation: string,
    roomName: string,
    meal: boolean,
    password: string
}
export interface Room {
    _id: string;
    roomName: string;
    capacity: number;
    occupants: Array<Alumni>;
    roomDetails: string;
}
export interface RoomInfo {
    location: string;
    rooms: Array<Room>;
}