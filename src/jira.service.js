import axios from 'axios';
import settings from './config/config';

function transitionIssueToCodeReview(jiraIssueKey, callback) {
  if (!settings.jiraTransitionUrl || !jiraIssueKey) {
    return;
  }

  var uri = settings.jiraTransitionUrl;
  var payload = { issues: [jiraIssueKey] };

  axios.post(uri, payload)
    .then((res) => {

    })
    .catch((error) => {
      console.log(error);
      callback(error, null);
    });
}

module.exports = {
  transitionIssueToCodeReview: transitionIssueToCodeReview
}