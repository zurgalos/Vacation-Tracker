const jwt = require("jsonwebtoken");

async function getNewToken(user) {
  const payload = {
    user: {
      userId: user.userId,
      isAdmin: user.isAdmin,
    },
  };
  return jwt.sign(payload, config.Jwt_Secret, { expiresIn: "1h" });
}

module.exports = getNewToken;
