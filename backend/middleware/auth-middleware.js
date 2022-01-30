const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization-token");
  if (!token) {
    return res.status(401).json({ msg: "no token, auth denied" });
  }
  try {
    // compare the request.body token with the stored token
    const decoded = jwt.verify(token, config.Jwt_Secret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "token not valid!" });
  }
};
