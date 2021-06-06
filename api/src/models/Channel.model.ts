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
} from "sequelize-typescript";

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
}

export default Channel;
