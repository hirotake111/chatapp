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
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import Thread from "./Thread.model";

@Table
class Message extends Model {
  @IsUUID(4)
  @NotNull
  @PrimaryKey
  @Column({ allowNull: false })
  id!: string;

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

  @NotNull
  @Column({ allowNull: false })
  message!: string;

  @ForeignKey(() => Thread)
  thread!: Thread;
}

export default Message;
