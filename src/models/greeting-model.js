function GreetingModel(sequelize, DataTypes) {
  return sequelize.define(
    "Greeting",
    {
      guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "oneGreetingPerGuild"
      },
      creator_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "oneGreetingPerGuild"
      },
      volume: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    { underscored: true }
  );
}

module.exports = GreetingModel;
