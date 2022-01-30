const dal = require("../dal/dal");

async function getAllVacationsAsync() {
  try {
    const sql = `SELECT vacations.*, COUNT(followers.vacationId) as totalFollowers FROM vacations LEFT JOIN followers ON vacations.vacationId = followers.vacationId GROUP BY vacations.vacationId`;
    let vacations = await dal.executeAsync(sql);
    vacations = vacations.map((vacation) => ({
      ...vacation,
      imageFileName:
        process.env.NODE_ENV === "production"
          ? "" + vacation.imageFileName
          : "http://localhost:3001" + vacation.imageFileName,
    }));
    return vacations;
  } catch (error) {
    return false;
  }
}
async function getOneVacationAsync(vacationId) {
  try {
    const sql = `SELECT * FROM vacations WHERE vacationId = ${vacationId}`;
    const vacation = await dal.executeAsync(sql);
    if (process.env.NODE_ENV === "production") {
      vacation[0].imageFileName = "" + vacation[0].imageFileName;
    } else {
      vacation[0].imageFileName =
        "http://localhost:3001/" + vacation[0].imageFileName;
    }
    return vacation;
  } catch (error) {
    return false;
  }
}
async function getAllFollowedVacationsAsync(userId) {
  try {
    const sql = `SELECT vacations.*, count(followers.vacationId) as totalFollowers FROM vacations LEFT JOIN followers ON vacations.vacationId = followers.vacationId WHERE followers.userId = ${userId}  GROUP BY vacations.vacationId`;
    let vacations = await dal.executeAsync(sql);
    vacations = vacations.map((vacation) => ({
      ...vacation,
      imageFileName:
        process.env.NODE_ENV === "production"
          ? "" + vacation.imageFileName
          : "http://localhost:3001" + vacation.imageFileName,
    }));
    return vacations;
  } catch (error) {
    return false;
  }
}
async function addVacationAsync(vacation) {
  try {
    const sql = `INSERT INTO vacations(description, destination, imageFileName, startVacationDate, endVacationDate, price)
      VALUES("${vacation.description}", '${vacation.destination}',
      '${vacation.imageFileName}', '${vacation.startVacationDate}', '${vacation.endVacationDate}', ${vacation.price})`;
    const info = await dal.executeAsync(sql);
    vacation.vacationId = info.insertId;
    return vacation;
  } catch (error) {
    return false;
  }
}

async function updateVacation(vacation) {
  try {
    let sql = "UPDATE vacations SET ";

    if (vacation.description !== undefined) {
      sql += `description = "${vacation.description}",`;
    }

    if (vacation.destination !== undefined) {
      sql += `destination = '${vacation.destination}',`;
    }

    if (vacation.imageFileName !== undefined) {
      sql += `imageFileName = '${vacation.imageFileName}',`;
    }
    if (vacation.startVacationDate !== undefined) {
      sql += `startVacationDate = '${vacation.startVacationDate}',`;
    }
    if (vacation.endVacationDate !== undefined) {
      sql += `endVacationDate = '${vacation.endVacationDate}',`;
    }
    if (vacation.price !== undefined) {
      sql += `price = ${vacation.price},`;
    }

    sql = sql.substr(0, sql.length - 1); //Remove last comma

    sql += ` WHERE vacationId= ${vacation.vacationId}`;

    const info = await dal.executeAsync(sql);

    if (info.affectedRows) {
      const updatedVacation = await dal.executeAsync(
        `SELECT * from vacations where vacationId = ${vacation.vacationId}`
      );
      return updatedVacation;
    }
    return null;
  } catch (error) {
    return false;
  }
}

async function getVacationImageName(vacationId) {
  try {
    const sql = `SELECT imageFileName from vacations where vacations.vacationId = ${vacationId}`;
    const vacation = await dal.executeAsync(sql);
    return vacation[0].imageFileName;
  } catch (error) {
    return false;
  }
}
async function deleteVacation(vacationId) {
  try {
    const sqlToDeleteFromVacationsTable = `DELETE FROM vacations WHERE vacationId = ${vacationId}`;
    const sqlToDeleteFromFollowersTable = `DELETE FROM followers WHERE vacationId = ${vacationId}`;
    await dal.executeAsync(sqlToDeleteFromVacationsTable);
    await dal.executeAsync(sqlToDeleteFromFollowersTable);
    return true;
  } catch (error) {
    return false;
  }
}
async function getFollowersAmountForSpecificVacation(vacationId) {
  try {
    const sql = `SELECT followers.vacationId, count(followers.vacationId) as followers FROM followers JOIN vacations ON vacations.vacationId = followers.vacationId JOIN users ON followers.userId =users.userId where vacations.vacationId = ${vacationId} GROUP BY followers.vacationId`;
    const followedVacationIdAndNumOfFollowers = await dal.executeAsync(sql);
    return followedVacationIdAndNumOfFollowers;
  } catch (error) {
    return false;
  }
}

async function getFollowersAmountForAllVacations() {
  try {
    const sql = `SELECT vacations.destination, followers.vacationId, count(followers.vacationId) as followers FROM followers JOIN vacations ON vacations.vacationId = followers.vacationId JOIN users ON followers.userId =users.userId GROUP BY followers.vacationId`;

    const followedVacationsIdAndNumOfFollowers = await dal.executeAsync(sql);
    return followedVacationsIdAndNumOfFollowers;
  } catch (error) {
    return false;
  }
}

async function addFollowerToVacation(vacationId, userId) {
  try {
    const sql = `SELECT vacations.vacationId FROM vacations JOIN followers ON vacations.vacationId = followers.vacationId WHERE followers.userId = ${userId} GROUP BY followers.vacationId`;
    const followedVacationsIds = await dal.executeAsync(sql);
    if (
      followedVacationsIds.filter(
        (vacation) => vacation.vacationId === vacationId
      ).length > 0
    ) {
      return { msg: "vacation already followed" };
    }
    const sqlAddFollow = `INSERT INTO followers VALUES(
      DEFAULT,
      ${vacationId},
      ${userId})`;
    const response = await dal.executeAsync(sqlAddFollow);
    if (response.affectedRows > 0) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
async function removeFollowerToVacation(vacationId, userId) {
  try {
    const sql = `SELECT vacations.vacationId FROM vacations JOIN followers ON vacations.vacationId = followers.vacationId WHERE followers.userId = ${userId} GROUP BY followers.vacationId`;
    const followedVacationsIds = await dal.executeAsync(sql);
    if (
      followedVacationsIds.filter(
        (vacation) => vacation.vacationId === vacationId
      ).length === 0
    ) {
      return { msg: "vacation not followed yet" };
    } else {
      const sqlRemoveFollow = `DELETE FROM followers
      WHERE userId = ${userId}
      AND vacationId = ${vacationId}`;
      const response = await dal.executeAsync(sqlRemoveFollow);
      if (response.affectedRows > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getAllVacationsAsync,
  getOneVacationAsync,
  getAllFollowedVacationsAsync,
  addVacationAsync,
  updateVacation,
  getVacationImageName,
  deleteVacation,
  getFollowersAmountForSpecificVacation,
  getFollowersAmountForAllVacations,
  addFollowerToVacation,
  removeFollowerToVacation,
};
