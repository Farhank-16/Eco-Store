import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {

  try {

    const token =
      req.cookies?.token ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized, no token provided",
      });

    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized, invalid token",
    });

  }

};


export const isAdmin = (req, res, next) => {

  if (req.user?.role !== "admin") {

    return res.status(403).json({
      success: false,
      message: "Forbidden, admin access required",
    });

  }

  next();

};
