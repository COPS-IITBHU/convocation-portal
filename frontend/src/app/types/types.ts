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
    roomName: string;
    capacity: number;
    occupants: Array<Alumni>;
}
export interface RoomInfo {
    location: string;
    rooms: Array<Room>;
}