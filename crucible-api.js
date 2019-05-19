var axios = require('axios');
var urljoin = require('url-join');

export function getReviews(crucibleApiUrl, callback) {
  axios.get(urljoin(crucibleApiUrl, '/reviews-v1/filter/allOpenReviews'), {
      auth: {
        username: 'janedoe',
        password: 's00pers3cret'
      }
    })
    .then((res) => {
      callback(null, res);
    })
    .catch((error) => {
      console.log(error);
      callback(error, null);
    })
}