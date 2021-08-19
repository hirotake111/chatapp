import {
  Table,
  Model,
  Column,
  IsUUID,
  NotNull,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Sequelize,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import Message from "./Message.model";
import Roster from "./Roster.model";
import User from "./User.model";

@Table
class Channel extends Model {
  @IsUUID(4)
  @NotNull
  @PrimaryKey
  @Column({ allowNull: false })
  id!: string;

  @NotNull
  @Column({ allowNull: false })
  name!: string;

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

  @BelongsToMany(() => User, () => Roster)
  users!: User[];

  @HasMany(() => Message)
  messages!: Message[];
}

export default Channel;
