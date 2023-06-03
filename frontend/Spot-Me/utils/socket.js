import { io } from 'socket.io-client';
import { SOCKET_IO_PORT } from "@env"

const socket = io(SOCKET_IO_PORT, {
    withCredentials: true,
    path: '/socket.io/'
})


export default socket;


