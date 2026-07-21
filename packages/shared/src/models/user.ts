import { ToDoItem } from "./todo";

export interface User {
  id: number;
  todoItems: ToDoItem[];
  username: string;
}
