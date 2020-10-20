const Sequelize = require('sequelize');

//sets up model for course
module.exports = (sequelize) => {
    class User extends Sequelize.Model{}
    User.init({
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName:{
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName:{
            type: Sequelize.TEXT,
            allowNull: false
        },
        emailAddress:{
            type: Sequelize.STRING,
            allowNull: false
        },
        password:{
            type: Sequelize.STRING,
            allowNull: false
        }
    }, { sequelize});

    User.associate = (models) => {
      User.hasMany(models.Course);
    };

    return User;
}