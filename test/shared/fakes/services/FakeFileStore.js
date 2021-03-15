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

  async store(file) {
    if (this.errorMessage) {
      throw new Error(this.errorMessage);
    }

    this.files.push({
      file,
    });

    return {
      url: `https://example.com/${file.folder}/${file.originalname}`,
      type: "image",
    };
  }
}

module.exports = FakeFileStore;
