const fs = require("fs");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL);
const Sound = require("./sound")(sequelize, Sequelize);
const Greeting = require("./greeting")(sequelize, Sequelize);

(async () => {
  await sequelize.sync({ alter: true });
})();

module.exports = { Sound, Greeting };
