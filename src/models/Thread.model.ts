import {
  Table,
  Model,
  Column,
  HasMany,
  IsUUID,
  NotNull,
  PrimaryKey,
} from "sequelize-typescript";
import Message from "./Message.model";

@Table
class Thread extends Model {
  @IsUUID(4)
  @NotNull
  @PrimaryKey
  @Column({ allowNull: false })
  id!: string;

  @HasMany(() => Message)
  message?: Message[];
}

export default Thread;
