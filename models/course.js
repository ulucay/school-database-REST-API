const Sequelize = require('sequelize');

//sets up model for course
module.exports = (sequelize) => {
    class Course extends Sequelize.Model{}
    Course.init({
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title:{
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                notNull:{
                    msg: "Course title is required"
                },
                notEmpty:{
                    msg: "Course title is required"
                }
            }
        },
        description:{
            type: Sequelize.TEXT,
            allowNull: false,
            validate:{
                notNull:{
                    msg: "Course description is required"
                },
                notEmpty:{
                    msg: "Course description is required"
                }
            }
        },
        estimatedTime:{
            type: Sequelize.STRING,
            allowNull: true
        },
        materialsNeeded:{
            type: Sequelize.STRING,
            allowNull: true
        }
    }, { sequelize});

    Course.associate = (models) => {
      Course.belongsTo(models.User, {
          foreignKey:{
              fieldName: "userId",
              allowNull: false,
          }
      });
    }
    return Course;
}
