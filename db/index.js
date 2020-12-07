const { Sequelize, DataTypes } = require('Sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

const User = sequelize.define('MyUser',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    // Other model options go here
  }
);

module.exports = {
  sequelize: sequelize,
  User: User,
}
