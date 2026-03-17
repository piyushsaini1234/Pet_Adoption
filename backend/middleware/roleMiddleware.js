// Restrict route access to specific roles
// Usage: restrictTo('admin') or restrictTo('admin', 'moderator')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = { restrictTo };
