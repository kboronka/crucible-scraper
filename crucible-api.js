var axios = require('axios');
var urljoin = require('url-join');

module.exports = {
  getReviews: function(crucibleApiUrl, callback) {
    axios.get(urljoin(crucibleApiUrl, '/reviews-v1/filter/allOpenReviews'), {
        auth: {
          username: 'janedoe',
          password: 's00pers3cret'
        }
      })
      .then((res) => {
        callback(null, res.body);
      })
      .catch((error) => {
        console.log(error.body);
        callback(error.body, null);
      })
  }
}