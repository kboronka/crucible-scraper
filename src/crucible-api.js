var axios = require('axios');
var urljoin = require('url-join');

module.exports = {
  getReviews: function(crucibleApiUrl, callback) {
    axios.get(urljoin(crucibleApiUrl, '/reviews-v1/filter/allOpenReviews'), {
        auth: {
          username: 'admin',
          password: 'password'
        }
      })
      .then((res) => {
        callback(null, res.data);
      })
      .catch((error) => {
        callback(error.message, null);
      })
  }
}