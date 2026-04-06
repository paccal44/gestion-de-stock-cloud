function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function roleGuard(allowedRoles) {
  return (req, res, next) => {
    const role = req.headers["x-user-role"];

    if (!role) {
      return res.status(401).json({
        message: "Acces refuse : role utilisateur manquant"
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Acces refuse : permissions insuffisantes"
      });
    }

    next();
  };
}

module.exports = {
  createId,
  roleGuard
};
