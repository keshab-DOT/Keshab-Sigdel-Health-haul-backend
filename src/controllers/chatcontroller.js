import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/userModel.js";
import { getIO } from "../utils/socket.js";

const hasRole = (user, role) =>
  user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()) ?? false;

// GET /api/chat/users
export const getChatUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const me = await User.findById(myId).select("roles").lean();

    const iAmAdmin    = hasRole(me, "admin");
    const iAmPharmacy = hasRole(me, "pharmacy");

    let roleFilter;
    if (iAmAdmin) {
      // Admin can only chat with pharmacies
      roleFilter = { roles: { $elemMatch: { $regex: /^pharmacy$/i } } };
    } else if (iAmPharmacy) {
      // Pharmacy can chat with both users AND admins
      roleFilter = { roles: { $elemMatch: { $regex: /^(user|admin)$/i } } };
    } else {
      // User can only chat with pharmacies
      roleFilter = { roles: { $elemMatch: { $regex: /^pharmacy$/i } } };
    }

    const allUsers = await User.find({
      _id: { $ne: myId },
      ...roleFilter,
    })
      .select("name email roles profileImage")
      .lean();

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const conversationMap = new Map();
    messages.forEach((m) => {
      const otherId =
        m.senderId.toString() === myId.toString()
          ? m.receiverId.toString()
          : m.senderId.toString();
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, m.image ? "📷 Image" : m.text || "");
      }
    });

    const result = allUsers.map((u) => ({
      ...u,
      lastMessage:     conversationMap.get(u._id.toString()) || null,
      hasConversation: conversationMap.has(u._id.toString()),
    }));

    result.sort((a, b) => {
      if (a.hasConversation && !b.hasConversation) return -1;
      if (!a.hasConversation && b.hasConversation) return 1;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({ users: result });
  } catch (error) {
    console.error("getChatUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/messages/:userId
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });

    const messages = await Message.find({
      $or: [
        { senderId: myId,   receiverId: userId },
        { senderId: userId, receiverId: myId   },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: userId, receiverId: myId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chat/send/:userId
export const sendMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId))
      return res.status(400).json({ message: "Invalid receiver ID" });

    if (!text && !req.file)
      return res.status(400).json({ message: "Message cannot be empty" });

    const imageUrl = req.file ? req.file.filename : "";

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text:  text || "",
      image: imageUrl,
    });

    const io = getIO();
    io.to(`user:${receiverId}`).emit("newMessage", newMessage);

    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/chat/messages/:messageId
// Only the sender can delete their own message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(messageId))
      return res.status(400).json({ message: "Invalid message ID" });

    const message = await Message.findById(messageId);

    if (!message)
      return res.status(404).json({ message: "Message not found" });

    // Only the sender can delete
    if (message.senderId.toString() !== myId.toString())
      return res.status(403).json({ message: "You can only delete your own messages" });

    await message.deleteOne();

    // Notify the receiver in real time so their UI updates too
    const io = getIO();
    io.to(`user:${message.receiverId}`).emit("messageDeleted", { messageId });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};