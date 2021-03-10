class FakeFileStore {
  static successful() {
    return new FakeFileStore();
  }

  static failure() {
    return new FakeFileStore("Oops!");
  }

  constructor(errorMessage = null) {
    this.errorMessage = errorMessage;
    this.files = [];
  }

  async store(file, location) {
    if (this.errorMessage) {
      throw new Error(this.errorMessage);
    }

    this.files.push({
      file,
      location,
    });

    return {
      url: `https://example.com/${location}`,
      type: "image",
    };
  }
}

module.exports = FakeFileStore;
