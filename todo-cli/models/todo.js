"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      console.log(await this.overdue());
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      console.log(await this.dueToday());
      console.log("\n");

      console.log("Due Later");
      console.log(await this.dueLater());
      // FILL IN HERE
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const date = new Date();
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: date },
        },
        order: [["dueDate", "ASC"]],
      });
      const todoList = todos
        .map((todo) => todo.displayTodoItems())
        .join("\n")
        .trim();
      return todoList;
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const date = new Date();
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: date },
        },
        order: [["dueDate", "ASC"]],
      });
      const todoList = todos
        .map((todo) => todo.displayTodoItems())
        .join("\n")
        .trim();
      return todoList;
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const date = new Date();
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: date },
        },
        order: [["dueDate", "ASC"]],
      });
      const todoList = todos
        .map((todo) => todo.displayTodoItems())
        .join("\n")
        .trim();
      return todoList;
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true;
        await todo.save();
      }
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      const day = new Date(this.dueDate);
      return day.getDate() === new Date().getDate()
        ? `${this.id}. ${checkbox} ${this.title}`.trim()
        : `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`.trim();
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
