import { verifyJWT } from "../utils/tokens.js";

const auth = (roles = null) => {
  return async (req, res, next) => {
    try {
      const authToken = req.cookies?.authToken;

      // No token
      if (!authToken) {
        return res.status(401).json({ message: "Unauthorized. No token." });
      }

      // Verify token
      const user = await verifyJWT(authToken);

      // verifyJWT throws if invalid, so this is just safety
      if (!user) {
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
      }

      // Attach decoded user
      req.user = user;

      // Role check (FIXED)
      if (roles) {
        const userRoles = Array.isArray(user.roles)
          ? user.roles
          : [user.roles];

        if (Array.isArray(roles)) {
          const allowed = roles.some((r) => userRoles.includes(r));
          if (!allowed) {
            return res
              .status(403)
              .json({ message: "Forbidden. Insufficient permissions." });
          }
        } else {
          if (!userRoles.includes(roles)) {
            return res
              .status(403)
              .json({ message: "Forbidden. Insufficient permissions." });
          }
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


