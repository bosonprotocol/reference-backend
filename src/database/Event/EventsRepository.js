// @ts-nocheck
const Event = require("../models/Event");

class EventsRepository {
  async createExpectedEvent(metadata) {
    const event = new Event({
      _tokenIdVoucher: metadata._tokenIdVoucher,
      _to: metadata._to,
      _payment: metadata._payment,
      _type: metadata._type,
      txHash: metadata.txHash,
    });

    await event.save();
  }

  async create({
    name,
    address: address,
    _correlationId,
    _tokenId,
  }) {
    const event = new Event({
      name,
      address: address,
      _correlationId,
      _tokenId
    })

    return await event.save();
  }

  async update(event) {
    event.eventDetected = true;
    return await event.save()
  }


  async findByCorrelationId(metadata) {
    const event = await Event.findOne({
      name: metadata.name,
      _correlationId: metadata._correlationId,
      address: metadata.address
    })

    if (!event) {
      throw new Error(`Event with Correlation Id: ${metadata._correlationId} for User: ${metadata.address} does not exist!`)
    }

    return event
  }

  async findByTokenId(metadata) {
    const event = await Event.findOne({
      name: metadata.name,
      _tokenId: metadata._tokenId
    })

    if (!event) {
      throw new Error(`Event with Correlation Id: ${metadata._correlationId} for User: ${metadata.address} does not exist!`)
    }

    return event
  }

  async getAllDetected() {
    return await Event.find({eventDetected: true})
  }

  async getAllFailed() {
    return await Event.find({eventDetected: false})
  }
}

module.exports = EventsRepository;
