import express, { type Request, type Response } from "express";
import cors from "cors";
import { z } from "zod";
import type { User, ToDoItem } from "@repo/shared";
import { initialUsers, initialTodos } from "../db/seed";

const app = express();
app.use(cors());
app.use(express.json());

// --- SIMULATE REAL NETWORK DELAY (0.5s - 1.5s) ---
app.use((req: Request, res: Response, next) => {
  const delay = Math.floor(Math.random() * 1000) + 500; // 500ms to 1500ms
  setTimeout(next, delay);
});

// --- ZOD SCHEMAS FOR VALIDATION ---

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(250, "Username cannot exceed 250 characters"),
  createdDate: z.string().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().trim().min(1).max(250).optional(),
  todoUpdates: z
    .array(
      z.object({
        id: z.number().int(),
        isCompleted: z.boolean(),
      }),
    )
    .optional(),
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

function getNextUserId(): number {
  let max = 0;
  for (const u of users) {
    if (typeof u.id === "number" && u.id > max) {
      max = u.id;
    }
  }
  return max + 1;
}

function getNextTodoId(): number {
  let max = 100;
  for (const t of todos) {
    if (typeof t.id === "number" && t.id > max) {
      max = t.id;
    }
  }
  return max + 1;
}

// --- STATUS ENDPOINT ---

app.get("/api/status", (req: Request, res: Response) => {
  res.json({ status: `Server is running: ${new Date().toISOString()}` });
});

// --- USER ENDPOINTS ---

// GET /api/users - Get paginated users with their todos
app.get("/api/users", (req: Request, res: Response) => {
  const pageIndex = Math.max(1, Number(req.query.pageIndex) || 1);
  const pageSize = 10;
  const startIndex = (pageIndex - 1) * pageSize;

  const paginatedUsers = users
    .slice(startIndex, startIndex + pageSize)
    .map(populateUser);

  res.json({
    data: paginatedUsers,
    total: users.length,
    pageIndex,
  });
});

// POST /api/users - Create a new user
app.post("/api/users", (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { username, createdDate } = parseResult.data;
  const newUser: User = {
    id: getNextUserId(),
    username,
    createdDate: createdDate || new Date().toISOString(),
    todoItems: [],
  };

  users.unshift(newUser);
  res.status(201).json(newUser);
});

// GET /api/users/:id - Get a user by ID
app.get("/api/users/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(populateUser(user));
});

// PATCH /api/users/:id - Update user username and/or todo statuses
app.patch("/api/users/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { username, todoUpdates } = parseResult.data;

  // Update username if provided
  if (username !== undefined) {
    user.username = username;
  }

  // Batch-update todo isCompleted statuses if provided
  if (todoUpdates && todoUpdates.length > 0) {
    for (const update of todoUpdates) {
      const todo = todos.find((t) => t.id === update.id);
      if (todo) {
        todo.isCompleted = update.isCompleted;
      }
    }
  }

  res.json(populateUser(user));
});

// DELETE /api/users/:id - Delete a user and all assigned todos
app.delete("/api/users/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Remove user
  users.splice(index, 1);

  // Remove all associated todos assigned to this user
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i]?.assigneeId === userId) {
      todos.splice(i, 1);
    }
  }

  res.status(204).send();
});

// --- TODO ENDPOINTS ---

const TODO_PAGE_SIZE = 10;

// GET /api/todos - Get paginated todos (optionally filter by userId/assigneeId)
app.get("/api/todos", (req: Request, res: Response) => {
  const pageIndex = Math.max(1, Number(req.query.pageIndex) || 1);
  const userIdQuery = req.query.userId || req.query.assigneeId;

  const filtered = userIdQuery
    ? todos.filter((t) => t.assigneeId === Number(userIdQuery))
    : todos;

  const startIndex = (pageIndex - 1) * TODO_PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + TODO_PAGE_SIZE);

  res.json({
    data: paginated,
    total: filtered.length,
    pageIndex,
  });
});

// GET /api/todos/:id - Get a single todo by ID
app.get("/api/todos/:id", (req: Request, res: Response) => {
  const todoId = Number(req.params.id);
  const todo = todos.find((t) => t.id === todoId);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.json(todo);
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

  // Randomly fail 20% of the time to demonstrate rollback works
  if (Math.random() < 0.2) {
    return res
      .status(500)
      .json({ error: "Simulated server error for rollback testing" });
  }

  const newTodo: ToDoItem = {
    id: getNextTodoId(),
    title,
    isCompleted: isCompleted ?? false,
    assigneeId,
    createdDate: createdDate || new Date().toISOString(),
  };

  todos.unshift(newTodo);
  res.status(201).json(newTodo);
});

// PATCH /api/todos/:id - Update a single todo
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
  console.log(
    `       \nExpressJS started at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}\n`,
    `\nInitial with seed data at "apps/server/src/seed.ts"`,
  );
  console.log(`       -> Local: http://localhost:${PORT}\n`);
});
