const {User} = require('../db');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || 'please provide a secret';

function encodeUser(user) {
  return new Promise( (resolve, reject) => {
    jwt.sign(
        {'UserId': user.id},
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
        resolve(decoded.UserId);
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
    try {
      const UserId = await decodeUser(data.token);
      return await wrapped(UserId, data);
    } catch (error) {
      console.log('Invalid token in data: ', data);
    }
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
  return {success: true, token: token};
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
