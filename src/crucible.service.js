import axios from 'axios';
import urljoin from 'url-join';
import settings from './config/config';
import Review from './models/review.model';

var newReviewCallbacks = [];
var closedReviewCallbacks = [];

function pollReviews() {
  const timeoutAfterError = 15 * 60 * 1000; // 15 minutes
  const timeoutAfterSuccess = 30 * 1000; // 30 seconds

  findAllOpenReviews((err, dbOpenReviews) => {
    getOpenReviews((err, crucibleOpenReviewData) => {
      if (err) {
        setTimeout(pollReviews, timeoutAfterError);
      } else if (crucibleOpenReviewData) {
        var promises = [];

        crucibleOpenReviewData.forEach(review =>
          promises.push(new Promise((resolve, reject) =>
            upsertOpenReview(review, (err, inserted, updated) => {
              if (err) {
                reject(err);
              } else if (inserted) {
                emitReviewInserted(inserted);
                resolve(inserted.permaId);
              } else if (updated) {
                resolve(updated.permaId);
              }
            })
          ))
        );

        // find closed reviews
        if (dbOpenReviews) {
          var closedReviewsFound = dbOpenReviews.filter(function(dbReview) {
            return crucibleOpenReviewData.map(function(e) { return e.permaId.id; }).indexOf(dbReview.permaId) === -1;
          });

          closedReviewsFound.forEach(review =>
            promises.push(new Promise((resolve, reject) =>
              upsertClosedReview(review, (err, closed, abandoned) => {
                if (err) {
                  reject(err);
                } else if (closed) {
                  emitReviewClosed(closed);
                  resolve(closed.permaId);
                } else if (abandoned) {
                  resolve(abandoned.permaId);
                }
              })
            ))
          );
        }

        Promise.all(promises)
          .then(values => {
            console.log(values);
            setTimeout(pollReviews, timeoutAfterSuccess);
          })
          .catch(err => {
            console.log(err);
            setTimeout(pollReviews, timeoutAfterError);
          });
      } else {
        setTimeout(pollReviews, timeoutAfterSuccess);
      }
    });
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

function findAllOpenReviews(callback) {
  Review.findAllOpenReviews((err, reviews) => {
    callback(err, reviews);
  });
}

function upsertOpenReview(review, callback) {
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
              callback(null, newReview, null);
            } else {
              callback(null, null, newReview);
            }
          });
        }
      });
    }
  });

}

function upsertClosedReview(newReview, callback) {
  getDetails(newReview.permaId, (err, details) => {
    if (err) {
      callback(err, null, null);
    } else {
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

              newReview.state = details.state;
              Review.upsertReview(newReview, (err, success) => {
                if (err) {
                  callback(err, null, null);
                } else if (newReview.state === 'Closed') {
                  callback(null, newReview, null);
                } else {
                  callback(null, null, newReview);
                }
              });
            }
          });
        }
      });
    }
  });

}

function registerReviewInsertedCallback(callback) {
  newReviewCallbacks.push(callback);
}

function emitReviewInserted(review) {
  newReviewCallbacks.forEach(callback => {
    callback(review);
  });
}

function registerReviewClosedCallback(callback) {
  closedReviewCallbacks.push(callback);
}

function emitReviewClosed(review) {
  closedReviewCallbacks.forEach(callback => {
    callback(review);
  });
}

module.exports = {
  registerReviewInsertedCallback: registerReviewInsertedCallback,
  registerReviewClosedCallback: registerReviewClosedCallback,
  pollOpenReviews: function(callback) {
    setTimeout(pollReviews, 1000);
    callback();
  }
}