const chai = require("chai");
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const EventsRepository = require("../../src/database/Event/EventsRepository");
const Event = require("../../src/database/models/Event");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

describe("Payments Repository", () => {
  before(async () => {
    await Database.connect();
  });

  afterEach(async () => {
    await Database.truncateCollection(Event);
  });

  after(async () => {
    await Database.disconnect();
  });

  context("createEvent", () => {
    it("stores event", async () => {
      const metadata = Random.eventMetadata();
      const eventsRepository = new EventsRepository();
      const created = await eventsRepository.create(metadata);

      expect(created.name).to.eq(metadata.name);
      expect(created.address).to.eq(metadata.address);
      expect(created.eventDetected).to.be.false;
      expect(created._correlationId).to.eq(metadata._correlationId);
      expect(created._tokenId).to.eq(metadata._tokenId);
    });

    it("fails when name is missing", async () => {
      const metadata = Random.eventMetadata({ name: "" });
      const eventsRepository = new EventsRepository();

      await expect(eventsRepository.create(metadata)).to.be.rejectedWith(
        "Event validation failed: name: Path `name` is required."
      );
    });

    it("fails when address is missing", async () => {
      const metadata = Random.eventMetadata({ address: "" });
      const eventsRepository = new EventsRepository();

      await expect(eventsRepository.create(metadata)).to.be.rejectedWith(
        "Event validation failed: address: Path `address` is required."
      );
    });

    it("trims event name when including whitespace", async () => {
      const eventName = Random.eventName();
      const metadata = Random.eventMetadata({ name: ` ${eventName} ` });

      const eventsRepository = new EventsRepository();
      const created = await eventsRepository.create(metadata);

      expect(created.name).to.eq(eventName);
    });
  });

  context("updateEvent", () => {
    it("fails if address is missing", async () => {
      const metadata = Random.eventMetadata();
      const eventsRepository = new EventsRepository();

      let created = await eventsRepository.create(metadata);

      created.address = "";

      await expect(eventsRepository.update(created)).to.be.rejectedWith(
        "Event validation failed: address: Path `address` is required."
      );
    });

    it("fails if name is missing", async () => {
      const metadata = Random.eventMetadata();
      const eventsRepository = new EventsRepository();

      let created = await eventsRepository.create(metadata);

      created.name = "";

      await expect(eventsRepository.update(created)).to.be.rejectedWith(
        "Event validation failed: name: Path `name` is required."
      );
    });
  });

  context("findByCorrelationId", () => {
    it("finds event by specified _correlationId, address and event name", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();
      const found = await eventsRepository.findByCorrelationId({
        name: metadata.name,
        _correlationId: metadata._correlationId,
        address: metadata.address,
      });

      expect(found.toObject()).to.eql(event.toObject());
    });

    it("fails if address is missing", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();
      await expect(
        eventsRepository.findByCorrelationId({
          name: metadata.name,
          _correlationId: metadata._correlationId,
        })
      ).to.be.rejectedWith(
        `Event ${metadata.name} with Correlation Id: ${metadata._correlationId} for User: undefined does not exist!`
      );
    });

    it("fails if _correlationId is missing", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();
      await expect(
        eventsRepository.findByCorrelationId({
          name: metadata.name,
          address: metadata.address,
        })
      ).to.be.rejectedWith(
        `Event ${metadata.name} with Correlation Id: undefined for User: ${metadata.address} does not exist!`
      );
    });

    it("fails if name is missing", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();

      await expect(
        eventsRepository.findByCorrelationId({
          address: metadata.address,
          _correlationId: metadata._correlationId,
        })
      ).to.be.rejectedWith(
        `Event undefined with Correlation Id: ${metadata._correlationId} for User: ${metadata.address} does not exist!`
      );
    });
  });

  context("findByTokenId", () => {
    it("finds event by specified _tokenId and event name", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();
      const found = await eventsRepository.findByTokenId({
        name: metadata.name,
        _tokenId: metadata._tokenId,
      });

      expect(found.toObject()).to.eql(event.toObject());
    });

    it("fails if _tokenId is missing", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();

      await expect(
        eventsRepository.findByTokenId({
          name: metadata.name,
        })
      ).to.be.rejectedWith(
        `Event ${metadata.name} with Token Id: undefined does not exist!`
      );
    });

    it("fails if event name is missing", async () => {
      const metadata = Random.eventMetadata();
      const event = new Event(metadata);
      await event.save();

      const eventsRepository = new EventsRepository();

      await expect(
        eventsRepository.findByTokenId({
          _tokenId: metadata._tokenId,
        })
      ).to.be.rejectedWith(
        `Event undefined with Token Id: ${metadata._tokenId} does not exist!`
      );
    });
  });

  context("getAllDetected", () => {
    it("returns all events that have been detected", async () => {
      const metadata1 = Random.eventMetadata({ eventDetected: true });
      const metadata2 = Random.eventMetadata({ eventDetected: true });
      const metadata3 = Random.eventMetadata();

      const event1 = new Event(metadata1);
      const event2 = new Event(metadata2);
      const event3 = new Event(metadata3);

      await event1.save();
      await event2.save();
      await event3.save();

      const eventsRepository = new EventsRepository();

      let events = await eventsRepository.getAllDetected();

      expect(events.length).to.eq(2);
      expect(events[0].toObject()).to.eql(event1.toObject());
      expect(events[1].toObject()).to.eql(event2.toObject());
    });

    it("returns an empty list when there are no events", async () => {
      const eventsRepository = new EventsRepository();
      const events = await eventsRepository.getAllDetected();

      expect(events).to.eql([]);
    });
  });

  context("getAllFailed", () => {
    it("returns all events that have not been detected", async () => {
      const metadata1 = Random.eventMetadata({ eventDetected: true });
      const metadata2 = Random.eventMetadata();
      const metadata3 = Random.eventMetadata();

      const event1 = new Event(metadata1);
      const event2 = new Event(metadata2);
      const event3 = new Event(metadata3);

      await event1.save();
      await event2.save();
      await event3.save();

      const eventsRepository = new EventsRepository();

      let events = await eventsRepository.getAllFailed();

      expect(events.length).to.eq(2);
      expect(events[0].toObject()).to.eql(event2.toObject());
      expect(events[1].toObject()).to.eql(event3.toObject());
    });

    it("returns an empty list when there are no events", async () => {
      const eventsRepository = new EventsRepository();
      const events = await eventsRepository.getAllFailed();

      expect(events).to.eql([]);
    });
  });
});
