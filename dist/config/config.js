"use strict";

module.exports = {
  port: process.env.PORT || 4005,
  secret: process.env.SECRET || 'secret-goes-here',
  database: process.env.DATABASE || 'mongodb://localhost:27017/das-build',
  crucibleUrl: process.env.FECRU_API_URL || 'http://192.168.203.3:8060/rest-service/',
  admin: process.env.FECRU_API_USER || 'user',
  password: process.env.FECRU_API_PASSWORD || 'password',
  slackUrl: process.env.SLACK_WEBHOOK_URL || 'http://slack.com/webhook'
};
//# sourceMappingURL=config.js.map