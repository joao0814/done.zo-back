const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido!" });
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido!" });
  }
};
