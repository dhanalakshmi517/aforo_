import type { Task, GptResponse, User } from 'wasp/entities';

// Context type for operations
export interface OperationContext {
  user?: User;
  entities: {
    Task: {
      findMany: (args: any) => Promise<Task[]>;
      create: (args: any) => Promise<Task>;
      update: (args: any) => Promise<Task>;
      delete: (args: any) => Promise<Task>;
    };
    GptResponse: {
      findMany: (args: any) => Promise<GptResponse[]>;
      create: (args: any) => Promise<GptResponse>;
    };
    User: {
      update: (args: any) => Promise<User>;
    };
  };
}

export interface GenerateGptResponseInput {
  hours: string;
}

export interface CreateTaskInput {
  description: string;
}

export interface UpdateTaskInput {
  id: string;
  isDone?: boolean;
  time?: Date;
}

export interface DeleteTaskInput {
  id: string;
}

export type GenerateGptResponse = (args: GenerateGptResponseInput, context: OperationContext) => Promise<GeneratedSchedule>;
export type CreateTask = (args: CreateTaskInput, context: OperationContext) => Promise<Task>;
export type UpdateTask = (args: UpdateTaskInput, context: OperationContext) => Promise<Task>;
export type DeleteTask = (args: DeleteTaskInput, context: OperationContext) => Promise<Task>;
export type GetGptResponses = (args: Record<string, never>, context: OperationContext) => Promise<GptResponse[]>;
export type GetAllTasksByUser = (args: Record<string, never>, context: OperationContext) => Promise<Task[]>;

// GeneratedSchedule type for the AI response
export interface GptPayload {
  hours: string;
}

export interface GeneratedSchedule {
  mainTasks: Array<{
    name: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  subtasks: Array<{
    description: string;
    time: number;
    mainTaskName: string;
  }>;
}
