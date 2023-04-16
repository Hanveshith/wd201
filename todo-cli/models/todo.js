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
      const o = await this.overdue();
      const ovd = o.map((t) => t.displayableString());
      console.log(ovd.join("\n").trim());
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const dt = await this.overdue();
      const dtd = dt.map((t) => t.displayableString());
      console.log(dtd.join("\n").trim());
      console.log("\n");

      console.log("Due Later");
      const dl = await this.overdue();
      const dlt = dl.map((t) => t.displayableString());
      console.log(dlt.join("\n").trim());
      // FILL IN HERE
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const date = new Date();
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: date },
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const date = new Date();
      return await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: date },
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const date = new Date();
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: date },
        },
        order: [["dueDate", "ASC"]],
      });
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
