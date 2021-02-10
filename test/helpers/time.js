class Time {
  static async boundaries(fn, fuzz = 10) {
    const before = Date.now();
    const result = await fn();
    const after = Date.now();

    return [before - fuzz, after + fuzz, after - before, result];
  }
}

module.exports = Time;
