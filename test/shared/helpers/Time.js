class Time {
  static oneDayInSeconds() {
    return 24 * 60 * 60;
  }

  static oneDayInMilliseconds() {
    return Time.oneDayInSeconds() * 1000;
  }

  static daysInMilliseconds(days) {
    return days * Time.oneDayInMilliseconds();
  }

  static async boundaries(fn, fuzz = 10) {
    const before = Date.now();
    const result = await fn();
    const after = Date.now();

    return [before - fuzz, after + fuzz, after - before, result];
  }
}

module.exports = Time;
