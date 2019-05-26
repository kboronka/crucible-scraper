import axios from 'axios';
import settings from './config/config';
import time from './format-time';
import urljoin from 'url-join';

const green = "#2eb886";
const red = "#b72834";
const blue = "#3aa3e3";

function reviewCreatedAttachment(review) {
  console.log(`review started: ${review.permaId} - ${review.name}`);

  var reviewers = '';
  var delimiter = '';
  review.reviewers.forEach(reviewer => {
    reviewers += delimiter + reviewer.displayName;
    delimiter = ', ';
  });

  var reviewUri = urljoin(
    settings.crucibleUrl.replace('/rest-service', ''),
    'cru',
    review.permaId);

  var attachments = [{
    "fallback": `Review Started: ${review.permaId} - ${review.name}`,
    "color": blue,
    "title": "Review Started",
    "text": `${review.name}`,
    "fields": [{
      "title": "Author",
      "value": review.author.displayName,
      "short": false
    }, {
      "title": "Reviewers",
      "value": reviewers,
      "short": false
    }],
    "footer": "fecru-monitor",
    "ts": new Date(review.createDate).getTime() / 1000 | 0
  }, {
    "fallback": reviewUri,
    "color": blue,
    "attachment_type": "default",
    "actions": [{
      "type": "button",
      "text": "Open Review",
      "url": reviewUri
    }]
  }]

  return attachments;
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

  var attachments = [{
    "fallback": `Review Closed: ${review.permaId} - ${review.name}`,
    "color": green,
    "title": "Review Closed",
    "text": `${review.permaId} - ${review.name}`,
    "fields": [{
      "title": "Author",
      "value": review.author.displayName,
      "short": true
    }, {
      "title": "Moderator",
      "value": review.moderator.displayName,
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
    "footer": "fecru-monitor",
    "ts": new Date().getTime() / 1000 | 0
  }];

  return attachments;
}

function reviewAbandonedAttachment(review) {
  console.log(`review abandoned: ${review.permaId} - ${review.name}`);

  var startTime = new Date(review.createDate).getTime();
  var endTime = new Date().getTime();
  var durationMs = endTime - startTime;
  var durationTime = time.msToTime(durationMs);

  var attachments = [{
    "fallback": `Review Abandoned: ${review.permaId} - ${review.name}`,
    "color": red,
    "title": "Review Abandoned",
    "text": `${review.permaId} - ${review.name}`,
    "fields": [{
      "title": "Author",
      "value": review.author.displayName,
      "short": true
    }, {
      "title": "Duration",
      "value": durationTime,
      "short": true
    }],
    "footer": "fecru-monitor",
    "ts": new Date().getTime() / 1000 | 0
  }];

  return attachments;
}

function reviewCreated(review) {
  var uri = settings.slackUrl;
  var body = {
    "username": "ReviewBot",
    "icon_emoji": ":robot_face:",
    "text": "",
    "attachments": reviewCreatedAttachment(review)
  };

  axios.post(uri, body)
    .then(function(res) {})
    .catch(function(err) {
      console.log(err.message);
    });
}

function reviewClosed(review) {
  var uri = settings.slackUrl;
  var body = {
    "username": "ReviewBot",
    "icon_emoji": ":robot_face:",
    "text": "",
    "attachments": reviewClosedAttachment(review)
  };

  axios.post(uri, body)
    .then(function(res) {})
    .catch(function(err) {
      console.log(err.message);
    });
}

function reviewAbandoned(review) {
  var uri = settings.slackUrl;
  var body = {
    "username": "ReviewBot",
    "icon_emoji": ":robot_face:",
    "text": "",
    "attachments": reviewAbandonedAttachment(review)
  };

  axios.post(uri, body)
    .then(function(res) {})
    .catch(function(err) {
      console.log(err.message);
    });
}

module.exports = {
  reviewCreated: reviewCreated,
  reviewClosed: reviewClosed,
  reviewAbandoned: reviewAbandoned,
}