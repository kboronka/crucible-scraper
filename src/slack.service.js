import axios from 'axios';
import settings from './config/config';
import time from './format-time';


function reviewCreatedAttachment(review) {
  console.log(`review started: ${review.permaId} - ${review.name}`);

  var reviewers = '';
  var delimiter = '';
  review.reviewers.forEach(reviewer => {
    reviewers += delimiter + reviewer.displayName;
    delimiter = ', ';
  });

  var attachment = [{
    "fallback": `Review Started: ${review.permaId} - ${review.name}`,
    "color": "#b72834",
    "title": "Review Started",
    "text": `${review.name}`,
    "fields": [{
      "title": "author",
      "value": review.author.displayName,
      "short": false
    }, {
      "title": "Reviewers",
      "value": reviewers,
      "short": false
    }],
    "footer": "fecru-scraper",
    "ts": new Date(review.createDate).getTime() / 1000 | 0
  }];

  return attachment;
}

function reviewClosedAttachment(review) {
  console.log(`review closed: ${review.permaId} - ${review.name}`);

  var startTime = new Date(review.createDate).getTime();
  var endTime = new Date().getTime();
  var durationMs = endTime - startTime;
  var durationTime = time.msToTime(durationMs);

  var reviewers = '';
  var delimiter = '';
  review.reviewers.forEach(reviewer => {
    reviewers += delimiter + reviewer.displayName;
    delimiter = ', ';
  });

  var attachment = [{
    "fallback": `Review Closed: ${review.permaId} - ${review.name}`,
    "color": "#b72834",
    "title": "Review Closed",
    "text": `${review.permaId} - ${review.name}`,
    "fields": [{
      "title": "author",
      "value": review.author.displayName,
      "short": true
    }, {
      "title": "Duration",
      "value": durationTime,
      "short": true
    }, {
      "title": "Reviewers",
      "value": reviewers,
      "short": false
    }],
    "footer": "fecru-scraper",
    "ts": new Date().getTime() / 1000 | 0
  }];

  return attachment;
}

function reviewCreated(review) {
  var uri = settings.slackUrl;
  var body = {
    "channel": settings.slackChannel,
    "username": "ReviewBot",
    "icon_emoji": ":robot_face:",
    "text": "",
    "attachments": reviewCreatedAttachment(review)
  };

  axios.post(uri, body)
    .then(function(res) {
      //callback(null, res.data);
    })
    .catch(function(err) {
      console.log(err.message);
      //callback(err.message, null);
    });
}

function reviewClosed(review) {
  var uri = settings.slackUrl;
  var body = {
    "channel": settings.slackChannel,
    "username": "ReviewBot",
    "icon_emoji": ":robot_face:",
    "text": "",
    "attachments": reviewClosedAttachment(review)
  };

  axios.post(uri, body)
    .then(function(res) {
      // callback(null, res.data);
    })
    .catch(function(err) {
      console.log(err.message);
      // callback(err.message, null);
    });
}
module.exports = {
  reviewCreated: reviewCreated,
  reviewClosed: reviewClosed
}