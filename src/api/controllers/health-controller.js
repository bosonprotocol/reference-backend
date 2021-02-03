class HealthController {
  static async getHealth(req, res) {
    res.status(200).send({ healthy: true });
  }
}

module.exports = HealthController;
