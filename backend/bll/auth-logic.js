const dal = require("../dal/dal");

async function asyncRegisterUser(user) {
  try {
    const sql = `INSERT INTO users VALUES (DEFAULT, ?, ?, ?, ?, 0)`;
    const info = await dal.executeAsync(sql, [
      user.firstName,
      user.lastName,
      user.username,
      user.password,
    ]);
    user.userId = info.insertId;
    // '${user.firstName}', '${user.lastName}','${user.username}', '${user.password}'
    return user;
  } catch (err) {
    return false;
  }
}

async function getUser(credentials) {
  const sql = `SELECT * FROM users WHERE username= ?`;
  const users = await dal.executeAsync(sql, [credentials]);
  const user = users[0];
  return user ? user : false;
}
async function getAuthUser(userId) {
  const sql = `select * from users where userId= ?`;
  const users = await dal.executeAsync(sql, userId);
  const user = users[0];
  return user ? user : false;
}
module.exports = {
  getUser,
  asyncRegisterUser,
  getAuthUser,
};
