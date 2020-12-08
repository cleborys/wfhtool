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

const UserStatus = sequelize.define('UserStatus',
    {
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
);

User.hasMany(UserStatus);
UserStatus.belongsTo(User);

module.exports = {
  sequelize: sequelize,
  User: User,
  UserStatus: UserStatus,
};
