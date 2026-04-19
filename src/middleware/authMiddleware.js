import { verifyJWT } from "../utils/tokens.js";
import User from "../models/userModel.js";

const auth = (roles = null) => {
  return async (req, res, next) => {
    try {
      
      const authToken =
        req.cookies?.authToken ||
        req.headers?.authorization?.replace("Bearer ", "").trim();

      if (!authToken) {
        return res.status(401).json({ message: "Unauthorized. No token." });
      }

      const decoded = await verifyJWT(authToken);

      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
      }

      // Fetch fresh user from DB to get latest status
      const user = await User.findById(decoded._id || decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Unauthorized. User not found." });
      }

      // Block banned or suspended users on every request
      if (user.status === "Banned") {
        return res.status(403).json({ message: "Your account has been banned." });
      }

      if (user.status === "Suspended") {
        return res.status(403).json({ message: "Your account has been suspended." });
      }

      req.user = user;

      if (roles) {
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];

        if (Array.isArray(roles)) {
          const allowed = roles.some((r) => userRoles.includes(r));
          if (!allowed)
            return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
        } else {
          if (!userRoles.includes(roles))
            return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
        }
      }

      next();
    } catch (error) {
      console.error("JWT ERROR", error.message);
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }
  };
};

export default auth;