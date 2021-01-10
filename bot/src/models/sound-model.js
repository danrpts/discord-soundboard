function SoundModel(sequelize, DataTypes) {
  return sequelize.define(
    "Sound",
    {
      guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "oneSoundPerGuild"
      },
      creator_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "oneSoundPerGuild"
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      volume: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      underscored: true
    },
    {
      indexes: [
        {
          unique: false,
          fields: ["guild_id"]
        }
      ]
    }
  );
}

module.exports = SoundModel;
