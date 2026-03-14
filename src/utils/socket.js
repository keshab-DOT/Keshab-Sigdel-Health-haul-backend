import { Server } from "socket.io";

let io;
const userSocketMap = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Track online status via query param
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`[Socket] User ${userId} is now ONLINE`);
    }

    // Join personal notification room so targeted messages work
    socket.on("joinUserRoom", (uid) => {
      if (uid) {
        socket.join(`user:${uid}`);
        if (!userSocketMap[uid]) {
          userSocketMap[uid] = socket.id;
          io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
        console.log(`[Socket] ${socket.id} joined user room: user:${uid}`);
      }
    });

    socket.on("leaveUserRoom", (uid) => {
      if (uid) socket.leave(`user:${uid}`);
    });

    // Disconnect: mark user offline
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const disconnectedUserId = Object.keys(userSocketMap).find(
        (uid) => userSocketMap[uid] === socket.id
      );
      if (disconnectedUserId) {
        delete userSocketMap[disconnectedUserId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log(`[Socket] User ${disconnectedUserId} is now OFFLINE`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket first");
  return io;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];