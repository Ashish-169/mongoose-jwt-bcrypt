import jwt from "jsonwebtoken";
export const authenticateJWT = (req, res, next) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res.status(403).json({
      status: "Failed",
      message: "No token provided",
    });
  }

  const token = authorization.split(" ")[1];
  console.log("Received token: ", token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({
        status: "Failed",
        message: "Failed to authenticate token",
      });
    }

    req.user = decoded; // Attach decoded user data to req
    next();
  });
};
