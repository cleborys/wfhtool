const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

const User = sequelize.define('User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
      ],
    },
);

module.exports = {
  sequelize: sequelize,
  User: User,
};
