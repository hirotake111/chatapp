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
import User from "./User.model";

@Table
class Roster extends Model {
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

  @ForeignKey(() => User)
  User!: User;

  @ForeignKey(() => Thread)
  thread!: Thread;
}

export default Roster;
