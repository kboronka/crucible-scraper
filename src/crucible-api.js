import axios from 'axios';
import urljoin from 'url-join';
import settings from './config/config';
import Review from './models/review.model';

var newReviewCallbacks = [];

function pollReviews() {
  console.log('\n\npolling...');
  getOpenReviews((err, reviewData) => {
    if (err) {
      setTimeout(pollReviews, 60000);
    } else {
      if (reviewData) {
        var promises = [];

        reviewData.forEach(review => {
          promises.push(new Promise((resolve, reject) =>
            saveReview(review, (err, updated, inserted) => {
              if (err) {
                console.log(err);
                reject(err);
              } else if (inserted) {
                emitNewReview(inserted);
                resolve(inserted.permaId);
              } else {
                resolve(updated.permaId);
              }
            })
          ));
        });

        Promise.all(promises)
          .then(values => {
            console.log(values);
            console.log('polling again in 5s');
            setTimeout(pollReviews, 5000);
          })
          .catch(err => {
            console.log('polling again in 5s');
            setTimeout(pollReviews, 60000);
          });
      }
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
      console.log('getDetails error: ' + error.message);
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
      if (res.data && res.data.reviewer) {
        callback(null, res.data.reviewer);
      }
    })
    .catch((error) => {
      console.log('getReviewers error: ' + error.message);
      callback(error.message, null);
    });
}

function getComments(id, callback) {
  var uri = urljoin(settings.crucibleUrl, '/reviews-v1/', id, '/comments');
  var config = {
    auth: {
      username: settings.username,
      password: settings.password
    }
  };

  axios.get(uri, config)
    .then((res) => {
      if (res.data && res.data.comments) {
        callback(null, res.data.comments);
      }
    })
    .catch((error) => {
      console.log('getComments error: ' + error.message);
      callback(error.message, null);
    });
}

function findAllReviews(callback) {
  Review.findAllReviews((err, reviews) => {
    callback(err, reviews);
  });
}

function saveReview(review, callback) {
  var newReview = {
    projectKey: review.projectKey,
    permaId: review.permaId.id,
    name: review.name,
    state: review.state,
    creator: {
      userName: review.creator.userName,
      displayName: review.creator.displayName,
      avatarUrl: review.creator.avatarUrl,
    },
    author: {
      userName: review.creator.userName,
      displayName: review.creator.displayName,
      avatarUrl: review.creator.avatarUrl,
    },
    moderator: {
      userName: review.creator.userName,
      displayName: review.creator.displayName,
      avatarUrl: review.creator.avatarUrl,
    },
    createDate: review.createDate,
    dueDate: review.dueDate,
    hasDefects: false,
    isComplete: true,
    reviewers: []
  }

  getComments(newReview.permaId, (err, comments) => {
    if (err) {
      callback(err, null, null);
    } else {
      comments.forEach(comment => {
        if (!comment.draft && !comment.deleted) {
          newReview.hasDefects |= comment.defectRaised && !comment.defectApproved;
        }
      });

      getReviewers(newReview.permaId, (err, reviewers) => {
        if (err) {
          callback(err, null, null);
        } else {
          reviewers.forEach(reviewer => {
            var newReviewer = {
              userName: reviewer.userName,
              displayName: reviewer.displayName,
              avatarUrl: reviewer.avatarUrl,
              completed: reviewer.completed,
              timeSpent: reviewer.timeSpent ? reviewer.timeSpent : 0
            }

            newReview.isComplete &= newReviewer.completed;
            newReview.reviewers.push(newReviewer);
          });

          Review.upsertReview(newReview, (err, success) => {
            if (err) {
              callback(err, null, null);
            } else if (success.nModified == 0 && success.upserted) {
              callback(null, null, newReview);
            } else {
              callback(null, newReview, null);
            }
          });
        }
      });
    }
  });

}

function registerNewReviewCallback(callback) {
  newReviewCallbacks.push(callback);
}

function emitNewReview(review) {
  newReviewCallbacks.forEach(callback => {
    callback(review);
  });
}

module.exports = {
  getOpenReviews: getOpenReviews,
  registerNewReviewCallback: registerNewReviewCallback,
  pollOpenReviews: function(callback) {
    findAllReviews((err, reviews) => {
      if (err) {
        console.log(err);
      } else {
        console.log(reviews);
      }

      setTimeout(pollReviews, 1000);
      callback();
    });
  }
}