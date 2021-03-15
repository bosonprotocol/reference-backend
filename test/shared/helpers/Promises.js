class Promises {
  static promisify(fn, target = null) {
    return function () {
      return new Promise((resolve, reject) => {
        fn.apply(target, [
          ...arguments,
          (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          },
        ]);
      });
    };
  }
}

module.exports = Promises;
