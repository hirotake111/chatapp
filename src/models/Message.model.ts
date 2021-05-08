import {
  Table,
  Model,
  Column,
  PrimaryKey,
  IsUUID,
  Unique,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  NotNull,
  Sequelize,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User } from "./User.model";

@Table
export class Thread extends Model {
  @HasMany(() => Message)
  @Column
  message!: Message;
}

@Table
export class Roster extends Model {
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
  @BelongsTo(() => User)
  @Column({ allowNull: false })
  User!: User;

  @BelongsTo(() => Thread)
  @Column
  thread!: Thread;
}

@Table
export class Message extends Model {
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

  @BelongsTo(() => Thread)
  @Column
  thread!: Thread;
}
