import jwt from "jsonwebtoken";

/**
 * Verify the bearer token and attach the decoded user payload to the request.
 */
export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // Reject requests that do not provide an access token.
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; 

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);
    // Return a uniform 401 when token verification fails.
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
