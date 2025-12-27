// import { DataTypes } from "sequelize";
// import sequelize from "../client.js";

// const ChatMessage = sequelize.define(
//   "ChatMessage",
//   {
//     id: {
//       type: DataTypes.BIGINT,
//       autoIncrement: true,
//       primaryKey: true
//     },
//     sessionId: {
//       type: DataTypes.STRING(64),
//       allowNull: false,
//       field: "session_id"
//     },
//     role: {
//       type: DataTypes.ENUM("user", "assistant"),
//       allowNull: false
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false
//     }
//   },
//   {
//     tableName: "chat_messages",
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: false,
//     indexes: [
//       {
//         fields: ["session_id"]
//       }
//     ]
//   }
// );

// export default ChatMessage;


import { DataTypes } from "sequelize";
import sequelize from "../client.js";

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    sessionId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "session_id"
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: "chat_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        name: "chat_messages_session_id",
        fields: ["session_id"],
        unique: false
      }
    ]
  }
);

export default ChatMessage;
