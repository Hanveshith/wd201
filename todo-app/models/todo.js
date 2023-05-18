"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User,{
        foreignKey: 'userId'
      })
      // define association here
    }
    static addTodo({ title, dueDate,userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false,userId });
    }

    static getTodos() {
      return this.findAll();
    }

    setCompletionStatus(completed) {
      // if(completed)
      //   return this.update({ completed: false });
      // else{
      //   return this.update({ completed: true });}
      const status = !completed;
      return this.update({completed: status});
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static getoverdueTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: date,
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static getdueTodayTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: date,
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static getdueLaterTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: date,
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static getCompletedTodos(userId) {
      return this.findAll({
        where: {
          completed :{
            [Op.eq]: true,
            userId,
          },
        },
      });
    }
  }
    
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
