var isDebug = process.env.NODE_ENV ? true : false;

module.exports = {
  port: process.env.PORT || 4005,
  secret: process.env.SECRET || 'secret-goes-here',
  database: process.env.DATABASE || 'mongodb://localhost:27017/dbname',
  crucibleUrl: process.env.FECRU_API_URL || 'http://fecru:8060/rest-service/',
  projectKey: process.env.FECRU_PROJECT_KEY || 'CR',
  username: process.env.FECRU_API_USER || 'user',
  password: process.env.FECRU_API_PASSWORD || 'password',
  slackUrl: process.env.SLACK_WEBHOOK_URL || 'http://slack.com/webhook'
}