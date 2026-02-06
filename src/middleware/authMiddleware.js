import { verifyJWT } from "./utils/tokens.js";

const auth = async (req, res, next) => {
  try {
    const authToken = req.cookies.authToken;

    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await verifyJWT(authToken);
    req.user = data;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;