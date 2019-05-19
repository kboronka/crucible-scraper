"use strict";

var axios = require('axios');

var urljoin = require('url-join');

module.exports = {
  getReviews: function getReviews(crucibleApiUrl, callback) {
    axios.get(urljoin(crucibleApiUrl, '/reviews-v1/filter/allOpenReviews'), {
      auth: {
        username: 'janedoe',
        password: 's00pers3cret'
      }
    }).then(function (res) {
      callback(null, res.body);
    })["catch"](function (error) {
      console.log(error.body);
      callback(error.body, null);
    });
  }
};
//# sourceMappingURL=crucible-api.js.map