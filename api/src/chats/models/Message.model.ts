import {
  Table,
  Model,
  Column,
  PrimaryKey,
  IsUUID,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  NotNull,
  Sequelize,
  ForeignKey,
  BelongsTo,
  Length,
} from "sequelize-typescript";

import Channel from "./Channel.model";
import User from "./User.model";

@Table
class Message extends Model {
  @IsUUID(4)
  @NotNull
  @PrimaryKey
  @Column({ allowNull: false })
  id!: string;

  @IsUUID(4)
  @NotNull
  @ForeignKey(() => Channel)
  @Column({ allowNull: false })
  channelId!: string;

  @IsUUID(4)
  @NotNull
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  senderId!: string;

  @NotNull
  @Length({ max: 8192 })
  @Column({ allowNull: false })
  content!: string;

  @CreatedAt
  @Column({
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  })
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;

  @BelongsTo(() => Channel)
  channel!: Channel;

  @BelongsTo(() => User)
  sender!: User;
}

export default Message;
