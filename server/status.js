const {authorized} = require('./auth.js');

function setStatus(UserId, data) {
  console.log('User ', UserId, ' set status ', data);
}

module.exports = {
  setStatus: authorized(setStatus),
};
