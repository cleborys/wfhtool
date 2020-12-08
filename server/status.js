const {authorized} = require('./auth.js');
const {User, UserStatus} = require('../db');

async function setStatus(userId, data) {
  console.log('User ', userId, ' set status ', data);
  try {
    await UserStatus.create({
      status: data.new_status,
      UserId: userId,
    });
  } catch (error) {
    console.log('Error creating status update', error);
  }
  return await getLastStatus(userId);
}

async function getLastStatus(userId) {
  const statusUpdates = await UserStatus.findAll({
    limit: 1,
    where: {
      UserId: userId,
    },
    order: [['createdAt', 'DESC']],
    include: User,
  });
  if (statusUpdates.lenght === 0) {
    throw Error('No status update found');
  }
  const statusUpdate = statusUpdates[0].toJSON();
  return {status: statusUpdate.status, username: statusUpdate.User.name};
}

module.exports = {
  setStatus: authorized(setStatus),
};
