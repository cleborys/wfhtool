const {authorized} = require('./auth.js');
const {User, UserStatus} = require('../db');

async function setStatus(userId, data) {
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
  if (statusUpdates.length === 0) {
    const user = await User.findByPk(userId);
    if (user === null) {
      throw Error('User not found');
    }
    return {status: 'unknown', username: user.name};
  }
  const statusUpdate = statusUpdates[0].toJSON();
  return {status: statusUpdate.status, username: statusUpdate.User.name};
}

async function getAllStatuses() {
  // TODO: do this in a single query
  const allUsers = await User.findAll();
  const result = [];
  for (const user of allUsers) {
    result.push(await getLastStatus(user.id));
  }
  return result;
}

module.exports = {
  setStatus: authorized(setStatus),
  getAllStatuses: getAllStatuses,
};
