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

    // EXISTING: track online status via query param 
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`[Socket] User ${userId} is now ONLINE`);
    }

    // EXISTING: personal notification rooms 
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

    // EXISTING: disconnect 
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

    //  NEW: read role from query (used only for location events)
    // Does NOT affect any existing functionality — role is only checked
    // inside the new location events below
    const role = socket.handshake.query.role?.toLowerCase();

    // NEW: order rooms 
    // Pharmacy and user both join the same order room so location events
    // are delivered privately between them only
    socket.on("joinOrderRoom", (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket] ${userId} (${role}) joined order:${orderId}`);
      }
    });

    socket.on("leaveOrderRoom", (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    // NEW: admin monitoring room 
    // Admin joins this to see ALL pharmacy + user location events
    socket.on("joinAdminRoom", () => {
      socket.join("adminRoom");
      console.log(`[Socket] ${userId} joined adminRoom`);
    });

    // NEW: pharmacy broadcasts its live GPS 
    // Pharmacy emits "pharmacyShareLocation"
    // → user in the same order room receives "pharmacyLocation"
    // → admin room also receives it for monitoring
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

    // NEW: user shares their delivery location
    // User emits "userShareLocation"
    // → pharmacy in the same order room receives "userLocation"
    // → admin room also receives it for monitoring
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

    // NEW: notify order room when a participant disconnects 
    // The other side uses this to update their "online" status indicator
    // Piggybacks on the existing disconnect handler via a second listener
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