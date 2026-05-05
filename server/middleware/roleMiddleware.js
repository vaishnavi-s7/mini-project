/**
 * Allow a request to continue only when the authenticated user has the role.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
