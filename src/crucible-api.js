import axios from 'axios';
import urljoin from 'url-join';
import settings from './config/config';

function pollReviews() {
  getOpenReviews((err, reviewData) => {
    if (err) {
      setTimeout(pollReviews, 60000);
    } else {
      setTimeout(pollReviews, 5000);
      getReviewers('CR-2',
        (err, reviewers) => {
          if (err) {
            console.log(err);
          } else {
            console.log('\n\n');
            console.log(JSON.stringify(reviewers));
            console.log('\n\n');
          }
        }
      );
    }
  });
}

function getOpenReviews(callback) {
  var uri = urljoin(settings.crucibleUrl, '/reviews-v1/filter/allOpenReviews');
  var config = {
    auth: {
      username: settings.username,
      password: settings.password
    }
  };

  axios.get(uri, config)
    .then((res) => {
      if (res.data && res.data.reviewData) {
        callback(null, res.data.reviewData);
      }
    })
    .catch((error) => {
      console.log('getOpenReviews error: ' + error.message);
      callback(error.message, null);
    });
}

function getDetails(id, callback) {
  var uri = urljoin(settings.crucibleUrl, '/reviews-v1/', id, '/details');
  var config = {
    auth: {
      username: settings.username,
      password: settings.password
    }
  };

  axios.get(uri, config)
    .then((res) => {
      if (res.data && res.data) {
        callback(null, res.data);
      }
    })
    .catch((error) => {
      console.log('getOpenReviews error: ' + error.message);
      callback(error.message, null);
    });
}

function getReviewers(id, callback) {
  var uri = urljoin(settings.crucibleUrl, '/reviews-v1/', id, '/reviewers');
  var config = {
    auth: {
      username: settings.username,
      password: settings.password
    }
  };

  axios.get(uri, config)
    .then((res) => {
      if (res.data && res.data) {
        callback(null, res.data);
      }
    })
    .catch((error) => {
      console.log('getOpenReviews error: ' + error.message);
      callback(error.message, null);
    });
}

module.exports = {
  getOpenReviews: getOpenReviews,
  pollOpenReviews: function(callback) {
    setTimeout(pollReviews, 1000);
    callback();
  }
}