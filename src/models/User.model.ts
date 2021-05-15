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
} from "sequelize-typescript";

@Table
class User extends Model {
  @IsUUID(4)
  @NotNull
  @PrimaryKey
  @Column({ allowNull: false })
  id!: string;

  @NotNull
  @Unique
  @Column({ allowNull: false })
  username!: string;

  @NotNull
  @Column({ allowNull: false })
  displayName!: string;

  @Column
  firstName?: string;

  @Column
  lastName?: string;

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

export default User;
