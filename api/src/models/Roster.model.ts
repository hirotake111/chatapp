import {
  Table,
  Model,
  Column,
  IsUUID,
  CreatedAt,
  DeletedAt,
  NotNull,
  Sequelize,
  ForeignKey,
} from "sequelize-typescript";
import Channel from "./Channel.model";
import User from "./User.model";

@Table
class Roster extends Model {
  @IsUUID(4)
  @NotNull
  @ForeignKey(() => Channel)
  @Column({ allowNull: false })
  channelId!: string;

  @IsUUID(4)
  @NotNull
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  userId!: string;

  @CreatedAt
  @Column({
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  })
  joinedAt!: Date;

  @DeletedAt
  removedAt?: Date;
}

export default Roster;
