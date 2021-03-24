const triggerExpirations = require("./src/triggerExpirations");
const triggerFinalizations = require("./src/triggerFinalizations");
const triggerWithdrawals = require("./src/triggerWithdrawals");

exports.triggerExpirationsDev =
  triggerExpirations.scheduledKeepersExpirationsDev;
exports.triggerFinalizationsDev =
  triggerFinalizations.scheduledKeepersFinalizationsDev;
exports.triggerWithdrawalsDev =
  triggerWithdrawals.scheduledKeepersWithdrawalsDev;

// Demo cloud functions
exports.triggerExpirationsDemo = triggerExpirations.scheduledKeepersExpirationsDemo;
exports.triggerFinalizationsDemo = triggerFinalizations.scheduledKeepersFinalizationsDemo;
exports.triggerWithdrawalsDemo = triggerWithdrawals.scheduledKeepersWithdrawalsDemo;

// Playground cloud functions
exports.triggerExpirationsPlayground = triggerExpirations.scheduledKeepersExpirationsPlayground;
exports.triggerFinalizationsPlayground = triggerFinalizations.scheduledKeepersFinalizationsPlayground;
exports.triggerWithdrawalsPlayground = triggerWithdrawals.scheduledKeepersWithdrawalsPlayground;
