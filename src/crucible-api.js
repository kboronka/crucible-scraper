import axios from 'axios';
import urljoin from 'url-join';
import config from './config/config';

function pollReviews() {
  console.log('poll reviews - ' + config.crucibleUrl);

  getOpenReviews((err, reviewData) => {
    if (err) {
      setTimeout(pollReviews, 60000);
    } else {
      console.log(reviewData);
      setTimeout(pollReviews, 5000);
    }
  });
}

function getOpenReviews(callback) {
  axios.get(urljoin(config.crucibleUrl, '/reviews-v1/filter/allOpenReviews'), {
      auth: {
        username: 'admin',
        password: 'password'
      }
    })
    .then((res) => {
      if (res.data && res.data.reviewData) {
        callback(null, res.data.reviewData);
      }
    })
    .catch((error) => {
      console.log('getOpenReviews error: ' + error.message);
      callback(error.message, null);
    })
}

module.exports = {
  getOpenReviews: getOpenReviews,
  pollOpenReviews: function(callback) {
    setTimeout(pollReviews, 1000);
    callback();
  }
}