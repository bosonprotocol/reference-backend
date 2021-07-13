class Promises {
  static promisify(fn, target = null) {
    return function () {
      return new Promise((resolve, reject) => {
        fn.apply(target, [
          ...arguments,
          (err, ...args) => {
            if (err) {
              reject(err);
            }
            resolve(args);
          },
        ]);
      });
    };
  }
}

module.exports = Promises;
