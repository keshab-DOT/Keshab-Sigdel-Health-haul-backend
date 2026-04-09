import { Server } from "socket.io";

let io;
const userSocketMap = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://healthhaul.netlify.app",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // track online status via query param 
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`[Socket] User ${userId} is now ONLINE`);
    }

    // personal notification rooms 
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

    // disconnect 
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

    const role = socket.handshake.query.role?.toLowerCase();

    socket.on("joinOrderRoom", (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket] ${userId} (${role}) joined order:${orderId}`);
      }
    });

    socket.on("leaveOrderRoom", (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    socket.on("joinAdminRoom", () => {
      socket.join("adminRoom");
      console.log(`[Socket] ${userId} joined adminRoom`);
    });

    socket.on("pharmacyShareLocation", ({ orderId, latitude, longitude, pharmacyName }) => {
      if (role === "pharmacy" && orderId) {
        io.to(`order:${orderId}`).emit("pharmacyLocation", {
          latitude,
          longitude,
          pharmacyName,
          orderId,
        });
        io.to("adminRoom").emit("pharmacyLocation", {
          latitude,
          longitude,
          pharmacyName,
          orderId,
          pharmacyId: userId,
        });
        console.log(`[Map] Pharmacy ${userId} → order ${orderId}: ${latitude}, ${longitude}`);
      }
    });

    socket.on("userShareLocation", ({ orderId, latitude, longitude }) => {
      if (role === "user" && orderId) {
        io.to(`order:${orderId}`).emit("userLocation", {
          latitude,
          longitude,
          orderId,
          userId,
        });
        io.to("adminRoom").emit("userLocation", {
          latitude,
          longitude,
          orderId,
          userId,
        });
        console.log(`[Map] User ${userId} → order ${orderId}: ${latitude}, ${longitude}`);
      }
    });

    socket.on("disconnect", () => {
      if (userId && role) {
        io.emit("participantOffline", { userId, role });
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