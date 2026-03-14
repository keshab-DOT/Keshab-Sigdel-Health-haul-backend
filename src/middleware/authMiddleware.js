import { verifyJWT } from "../utils/tokens.js";

const auth = (roles = null) => {
  return async (req, res, next) => {
    try {
      // Read token from cookie OR Authorization header
      const authToken =
        req.cookies?.authToken ||
        req.headers?.authorization?.replace("Bearer ", "").trim();

      if (!authToken) {
        return res.status(401).json({ message: "Unauthorized. No token." });
      }

      const user = await verifyJWT(authToken);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
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