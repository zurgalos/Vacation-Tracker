const Joi = require("joi");

class Vacation {
  constructor(
    vacationId,
    description,
    destination,
    imageFileName,
    startVacationDate,
    endVacationDate,
    price
  ) {
    if (vacationId !== undefined) this.vacationId = vacationId;
    if (description !== undefined) this.description = description;
    if (destination !== undefined) this.destination = destination;
    if (imageFileName !== undefined) this.imageFileName = imageFileName;
    if (startVacationDate !== undefined)
      this.startVacationDate = startVacationDate;
    if (endVacationDate !== undefined) this.endVacationDate = endVacationDate;
    if (price !== undefined) this.price = price;
  }

  static #schemaToPost = Joi.object({
    vacationId: Joi.optional(),
    description: Joi.string().required(),
    destination: Joi.string().required().min(0).max(500),
    imageFileName: Joi.string().required().min(0).max(200),
    startVacationDate: Joi.date().required(),
    endVacationDate: Joi.date().required(),
    price: Joi.number().required().max(10000),
  });

  validatePost() {
    const result = Vacation.#schemaToPost.validate(this, { abortEarly: false });
    return result.error ? result.error.details[0] : null; // null = no errors
  }

  static #schemaToPatch = Joi.object({
    vacationId: Joi.number().min(0),
    description: Joi.string(),
    destination: Joi.string().min(0).max(500),
    imageFileName: Joi.string().min(0).max(200),
    startVacationDate: Joi.date(),
    endVacationDate: Joi.date(),
    price: Joi.number(),
  });

  validatePatch() {
    const result = Vacation.#schemaToPatch.validate(this, {
      abortEarly: false,
    });
    return result.error ? result.error.details.map((err) => err.message) : null;
  }
}

module.exports = Vacation;
