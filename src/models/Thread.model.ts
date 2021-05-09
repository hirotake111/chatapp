import { Table, Model, Column, HasMany } from "sequelize-typescript";
import { Message } from "./Message.model";

@Table
export class Thread extends Model {
  @HasMany(() => Message)
  @Column
  message!: Message;
}
