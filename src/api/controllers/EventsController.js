const ApiError = require("../ApiError");

class EventsController {
  constructor(eventsRepository) {
    this.eventsRepository = eventsRepository;
  }

  async create(req, res, next) {
    let event;
    const address = res.locals.address;

    try {
      const metadata = {
        name: req.body.name,
        address: address,
        _correlationId: req.body._correlationId
          ? req.body._correlationId
          : null,
        _tokenId: req.body._tokenId ? req.body._tokenId : null,
      };

      event = await this.eventsRepository.create(metadata);
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(201).send({ eventId: event.id });
  }

  async updateByCorrelationId(req, res, next) {
    try {
      await this.eventsRepository.update(res.locals.event);
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(200).send({ updated: true });
  }

  async updateByTokenId(req, res, next) {
    try {
      await this.eventsRepository.update(res.locals.event);
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(200).send({ updated: true });
  }

  async getAll(req, res, next) {
    let detected, failed;
    try {
      detected = await this.eventsRepository.getAllDetected();
      failed = await this.eventsRepository.getAllFailed();
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(200).send({
      succeeded: detected.length,
      failed: failed.length,
      events: [...detected, ...failed],
    });
  }

  async getDetected(req, res, next) {
    let detected;

    try {
      detected = await this.eventsRepository.getAllDetected();
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(200).send({ succeeded: detected.length, events: detected });
  }

  async getFailed(req, res, next) {
    let failed;

    try {
      failed = await this.eventsRepository.getAllFailed();
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request!"));
    }

    res.status(200).send({ failed: failed.length, events: failed });
  }
}

module.exports = EventsController;
