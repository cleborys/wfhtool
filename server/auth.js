const {User} = require('../db');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || 'please provide a secret';

function encodeUser(user) {
  return new Promise( (resolve, reject) => {
    jwt.sign(
        {'userId': user.id},
        secret,
        {'expiresIn': '2d'},
        (error, token) => {
          if (error) {
            reject(error);
          } else {
            resolve(token);
          }
        },
    );
  });
}

function decodeUser(token) {
  return new Promise( (resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded.userId);
      }
    });
  });
}

function authorizedDecorator(wrapped) {
  return async function(data) {
    if (data.token == null) {
      console.log('Unauthorized request data: ', data);
      return;
    }
    let userId;
    try {
      userId = await decodeUser(data.token);
    } catch (error) {
      console.log('Invalid token in data: ', data);
      return;
    }
    return await wrapped(userId, data);
  };
}

async function loginSocket(data) {
  if (data.name === undefined) {
    return {success: false, token: ''};
  }
  user = await User.findOne({where: {name: data.name}});
  if (user === null) {
    return {success: false, token: ''};
  }

  const token = await encodeUser(user);
  return {success: true, token: token, username: user.name};
}

async function createUser(data) {
  if (data.name === undefined) {
    return {success: false, msg: 'No username provided'};
  }
  try {
    await User.create( {name: data.name} );
  } catch (error) {
    return {success: false, msg: error.toString()};
  }
  return {success: true, msg: 'Successfully created  a user'};
}

module.exports = {
  loginSocket: loginSocket,
  authorized: authorizedDecorator,
  createUser: createUser,
};
