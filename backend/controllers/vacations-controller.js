const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const vacationsLogic = require("../bll/vacations-logic");
const Vacation = require("../models/vacation-model");
const uuid = require("uuid");
const fs = require("fs");
const router = express.Router();

// Get all vacations
router.get("/", authMiddleware, async (req, res) => {
  try {
    let vacations = await vacationsLogic.getAllVacationsAsync();
    if (!vacations) {
      return res.status(400).json({ msg: "There are no vacations!" });
    }
    res.json(vacations);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Get one vacation
router.get(
  "/get-one-vacation/:vacationId",
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.isAdmin === 0) {
        return res.status(403).send("Authorization Error");
      }
      const vacationId = +req.params.vacationId;
      const vacationFromDB = await vacationsLogic.getOneVacationAsync(
        vacationId
      );
      let vacation = vacationFromDB[0];
      if (!vacation) {
        return res.status(400).json({ msg: "There is no vacation" });
      }
      res.json(vacation);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

// Get all followed vacations
router.get("/my-vacations", authMiddleware, async (req, res) => {
  try {
    let vacations = await vacationsLogic.getAllFollowedVacationsAsync(
      req.user.userId
    );
    if (!vacations) {
      return res.status(400).json({ msg: "There are no vacations!" });
    }
    res.json(vacations);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Add vaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin === 0) {
      return res.status(403).send("Authorization error");
    }
    const imageFile = req.files.image;
    console.log(req.body);
    const receivedVacation = JSON.parse(req.body.vacation);

    const randomName = uuid.v4();
    const extention = imageFile.name.substr(imageFile.name.lastIndexOf("."));
    if (
      extention != ".jpg" &&
      extention != ".png" &&
      extention != ".gif" &&
      extention != ".jpeg"
    ) {
      return res.status(400).json({
        msg: "This file type is invalid. please insert jpg, jpeg, png, gif only.",
      });
    }
    imageFile.mv("./images/" + randomName + extention);
    receivedVacation.imageFileName = "/images/" + randomName + extention;

    const vacation = new Vacation(
      undefined,
      receivedVacation.description,
      receivedVacation.destination,
      receivedVacation.imageFileName,
      receivedVacation.startVacationDate,
      receivedVacation.endVacationDate,
      receivedVacation.price
    );
    const error = vacation.validatePost();
    if (error) {
      return res.status(400).json({ msg: error });
    }
    const addedVacation = await vacationsLogic.addVacationAsync(vacation);
    if (!addedVacation) {
      return res.status(400).json({ msg: "Failed to add vacation" });
    }
    const allVacationUpdated = await vacationsLogic.getAllVacationsAsync();
    const msg = "Admin has added a vacation to " + addedVacation.destination;
    global.socketServer.sockets.emit(
      "admin-change",
      allVacationUpdated,
      req.user.isAdmin,
      msg
    );
    res.status(201).json({ msg: "Vacation has been added!" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// update vaction
router.patch("/update", authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin === 0) {
      return res.status(403).send("Authorization error");
    }
    let newImageName = "";
    const receivedVacation = req.body.vacation;
    const receivedVacationParsed = JSON.parse(receivedVacation);
    let error = false;
    if (req.files) {
      const imageFile = req.files.image;
      const randomName = uuid.v4();
      const extention = imageFile.name.substr(imageFile.name.lastIndexOf("."));
      if (
        extention != ".jpg" &&
        extention != ".png" &&
        extention != ".gif" &&
        extention != ".jpeg"
      ) {
        return res.status(400).json({
          msg: "This file type is invalid. please insert jpg, jpeg, png, gif only.",
        });
      }
      imageFile.mv("./images/" + randomName + extention);
      newImageName = "/images/" + randomName + extention;

      if (process.env.NODE_ENV === "production") {
        fs.unlink(
          "." + receivedVacationParsed.imageFileName.substr(1),
          (err) => {
            try {
            } catch (error) {
              return res.status(400).json({ msg: "failed to delete image" });
            }
          }
        );
      } else {
        fs.unlink(
          "." + receivedVacationParsed.imageFileName.substr(22),
          (err) => {
            try {
            } catch (error) {
              return res.status(400).json({ msg: "failed to delete image" });
            }
          }
        );
      }
    }
    if (error) {
      return res.status(400).json({ msg: "failed to delete image" });
    }
    if (!newImageName) {
      newImageName = receivedVacationParsed.imageFileName.substr(22);
    }
    const vacation = new Vacation(
      receivedVacationParsed.vacationId,
      receivedVacationParsed.description,
      receivedVacationParsed.destination,
      newImageName,
      receivedVacationParsed.startVacationDate,
      receivedVacationParsed.endVacationDate,
      receivedVacationParsed.price
    );

    const errors = vacation.validatePatch();

    if (errors) {
      return res.status(400).json({ msg: errors[0] });
    }

    const updatedVacation = await vacationsLogic.updateVacation(vacation);
    if (!updatedVacation) {
      return res.status(400).json({ msg: "failed to update vacation!" });
    }

    let allVacationUpdated = await vacationsLogic.getAllVacationsAsync();
    const msg =
      "Admin has updated " +
      receivedVacationParsed.destination +
      " vacation deatils";

    global.socketServer.sockets.emit(
      "admin-change",
      allVacationUpdated,
      req.user.isAdmin,
      msg
    );
    res.status(201).json({ msg: "Vacation has been edited!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Delete vacation
router.delete("/delete/:vacationId", authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin === 0) {
      return res.status(403).send("Authorization error");
    }
    if (!req.params.vacationId) {
      return res.status(400).send("vacationId needed");
    }

    const vacationId = +req.params.vacationId;
    const vacation = await vacationsLogic.getOneVacationAsync(vacationId);
    const vacationName = vacation[0].destination;
    const vacationImageName = await vacationsLogic.getVacationImageName(
      vacationId
    );
    if (!vacationImageName) {
      return res.json({ msg: "failed to delete image" });
    }
    const isVacationDeleted = await vacationsLogic.deleteVacation(vacationId);

    if (!isVacationDeleted) {
      return res.json({ msg: "failed to delete vacation" });
    }

    fs.unlink("." + vacationImageName, async (err) => {
      try {
        const allVacationUpdated = await vacationsLogic.getAllVacationsAsync();
        const msg = "Admin has removed vacation to " + vacationName;
        global.socketServer.sockets.emit(
          "admin-change",
          allVacationUpdated,
          req.user.isAdmin,
          msg
        );
        res.status(204).json({ msg: "Vacation has been deleted!" });
      } catch (error) {
        return res.json({ msg: "failed to delete image" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// get Followers Amount For All Vacations
router.get("/all-vacations-followers", authMiddleware, async (req, res) => {
  try {
    const followedVacationsIdAndNumOfFollowers =
      await vacationsLogic.getFollowersAmountForAllVacations();
    if (!followedVacationsIdAndNumOfFollowers) {
      return res.json({ msg: "failed to get vacations" });
    }
    res.json(followedVacationsIdAndNumOfFollowers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get followers for a specific vacation
router.get(
  "/specific-vacation-followers/:vacationId",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.params.vacationId) {
        return res.status(400).send("vacationId needed");
      }
      const vacationId = +req.params.vacationId;
      const followedVacationIdAndNumOfFollowers =
        await vacationLogic.getFollowersAmountForSpecificVacation(vacationId);
      if (!followedVacationIdAndNumOfFollowers) {
        return res.json({ msg: "failed to get vacation" });
      }
      res.json(followedVacationIdAndNumOfFollowers);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

// add follower
router.post("/add-vacation-follower", authMiddleware, async (req, res) => {
  try {
    if (!req.body.vacationId) {
      return res.status(400).send("vacationId needed");
    }
    const vacationId = +req.body.vacationId;
    const userId = req.user.userId;
    const responseFromDB = await vacationsLogic.addFollowerToVacation(
      vacationId,
      userId
    );
    if (!responseFromDB) {
      return res.status(400).json({ msg: "following vacation failed" });
    }
    if (responseFromDB.msg) {
      return res.status(400).json({ msg: responseFromDB.msg });
    }

    res.status(201).json({ msg: "added to the followed vacations!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// remove follower
router.delete(
  "/remove-vacation-follower/:vacationId",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.params.vacationId) {
        return res.status(400).send("vacationId needed");
      }
      const vacationId = +req.params.vacationId;
      const userId = req.user.userId;
      const responseFromDB = await vacationsLogic.removeFollowerToVacation(
        vacationId,
        userId
      );
      if (!responseFromDB) {
        return res
          .status(400)
          .json({ msg: "removing following vacation failed" });
      }
      if (responseFromDB.msg) {
        return res.status(400).json({ msg: responseFromDB.msg });
      }

      res.status(201).json({ msg: "removed from the followed vacations!" });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

module.exports = router;
