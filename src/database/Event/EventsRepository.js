// @ts-nocheck
const Event = require("../models/Event");

class EventsRepository {
  async create({ name, address: address, _correlationId, _tokenId }) {
    const event = new Event({
      name,
      address: address,
      _correlationId,
      _tokenId,
    });

    return await event.save();
  }

  async update(event) {
    event.eventDetected = true;
    return await event.save();
  }

  async findByCorrelationId(metadata) {
    const event = await Event.findOne({
      name: metadata.name,
      _correlationId: metadata._correlationId,
      address: metadata.address,
    });

    if (!event) {
      throw new Error(
        `Event ${metadata.name} with Correlation Id: ${metadata._correlationId} for User: ${metadata.address} does not exist!`
      );
    }

    return event;
  }

  async findByTokenId(metadata) {
    const event = await Event.findOne({
      name: metadata.name,
      _tokenId: metadata._tokenId,
    });

    if (!event) {
      throw new Error(
        `Event ${metadata.name} with Token Id: ${metadata._tokenId} does not exist!`
      );
    }

    return event;
  }

  async getAllDetected() {
    return await Event.find({ eventDetected: true });
  }

  async getAllFailed() {
    return await Event.find({ eventDetected: false });
  }
}

module.exports = EventsRepository;
