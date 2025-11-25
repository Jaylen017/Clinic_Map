import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const setupSocketIO = (io: Server) => {
  ioInstance = io;
  
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join clinic room for real-time updates
    socket.on('join:clinic', (clinicId: string) => {
      socket.join(`clinic:${clinicId}`);
      console.log(`Socket ${socket.id} joined clinic:${clinicId}`);
    });

    // Leave clinic room
    socket.on('leave:clinic', (clinicId: string) => {
      socket.leave(`clinic:${clinicId}`);
      console.log(`Socket ${socket.id} left clinic:${clinicId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to emit timeslot updates
export const emitTimeslotUpdate = (clinicId: string, data: any) => {
  if (!ioInstance) {
    console.warn('Socket.IO instance not initialized');
    return;
  }
  ioInstance.to(`clinic:${clinicId}`).emit('timeslot:updated', data);
};
