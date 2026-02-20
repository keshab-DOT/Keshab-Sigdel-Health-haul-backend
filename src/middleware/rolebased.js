const roleBasedAuth = (allowedRoles) => {
  return (req, res, next) => {
    const hasRole = req.user.roles.some(role =>
      allowedRoles.includes(role)
    );

    if (hasRole) return next();

    res.status(403).json({
      message: "Forbidden: You don't have permission",
    });
  };
};

export default roleBasedAuth;