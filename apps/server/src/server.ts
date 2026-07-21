import express, { type Request, type Response } from "express";
import cors from "cors";
import { z } from "zod";
import type { User, ToDoItem } from "@repo/shared";
import { initialUsers, initialTodos } from "../db/seed";

const app = express();
app.use(cors());
app.use(express.json());

// --- ZOD SCHEMAS FOR VALIDATION ---

export const createUserSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  createdDate: z.string().optional(),
});

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  assigneeId: z.coerce.number().int(),
  isCompleted: z.boolean().optional().default(false),
  createdDate: z.string().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).optional(),
  isCompleted: z.boolean().optional(),
  assigneeId: z.coerce.number().optional(),
  createdDate: z.string().optional(),
});

// --- IN-MEMORY DATA STORE (INITIALIZED FROM SEED) ---

const todos: ToDoItem[] = [...initialTodos];
const users: User[] = [...initialUsers];

// Helper to populate a user's todoItems array
function populateUser(user: User): User {
  return {
    ...user,
    todoItems: todos.filter((t) => t.assigneeId === user.id),
  };
}

// --- STATUS ENDPOINT ---

app.get("/api/status", (req: Request, res: Response) => {
  res.json({ status: `Server is running: ${new Date().toISOString()}` });
});

// --- USER ENDPOINTS ---

// GET /api/users - Get all users with their todos
app.get("/api/users", (req: Request, res: Response) => {
  res.json(users.map(populateUser));
});

// POST /api/users - Create a new user
app.post("/api/users", (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { username, createdDate } = parseResult.data;
  const newUser: User = {
    id: Date.now(),
    username,
    createdDate: createdDate || new Date().toISOString(),
    todoItems: [],
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// GET /api/users/:id - Get a user by ID
app.get("/api/users/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(populateUser(user));
});

// --- TODO ENDPOINTS ---

// GET /api/todos - Get todos (optionally filter by userId or assigneeId)
app.get("/api/todos", (req: Request, res: Response) => {
  const userIdQuery = req.query.userId || req.query.assigneeId;

  if (userIdQuery) {
    const userId = Number(userIdQuery);
    const userTodos = todos.filter((t) => t.assigneeId === userId);
    return res.json(userTodos);
  }

  res.json(todos);
});

// POST /api/todos - Create a new todo
app.post("/api/todos", (req: Request, res: Response) => {
  const parseResult = createTodoSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { title, assigneeId, isCompleted, createdDate } = parseResult.data;

  const userExists = users.some((u) => u.id === assigneeId);
  if (!userExists) {
    return res
      .status(400)
      .json({ error: `User with id ${assigneeId} not found` });
  }

  // Simulate network delay to test optimistic UI
  setTimeout(() => {
    // Randomly fail 20% of the time to demonstrate rollback works
    if (Math.random() < 0.2) {
      return res
        .status(500)
        .json({ error: "Simulated server error for rollback testing" });
    }

    const newTodo: ToDoItem = {
      id: Date.now(),
      title,
      isCompleted: isCompleted ?? false,
      assigneeId,
      createdDate: createdDate || new Date().toISOString(),
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
  }, 1000);
});

// PATCH /api/todos/:id - Update todo status / details
app.patch("/api/todos/:id", (req: Request, res: Response) => {
  const todoId = Number(req.params.id);
  const todo = todos.find((t) => t.id === todoId);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const parseResult = updateTodoSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { title, isCompleted, assigneeId, createdDate } = parseResult.data;

  if (title !== undefined) todo.title = title;
  if (isCompleted !== undefined) todo.isCompleted = isCompleted;
  if (createdDate !== undefined) todo.createdDate = createdDate;
  if (assigneeId !== undefined) {
    const userExists = users.some((u) => u.id === assigneeId);
    if (!userExists) {
      return res
        .status(400)
        .json({ error: `User with id ${assigneeId} not found` });
    }
    todo.assigneeId = assigneeId;
  }

  res.json(todo);
});

// DELETE /api/todos/:id - Delete a todo
app.delete("/api/todos/:id", (req: Request, res: Response) => {
  const todoId = Number(req.params.id);
  const index = todos.findIndex((t) => t.id === todoId);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
