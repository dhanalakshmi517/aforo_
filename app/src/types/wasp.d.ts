declare module '@wasp/queries' {
  export function useQuery<T, A>(query: (args: A, context: any) => Promise<T>, args?: A): {
    data: T | undefined;
    isLoading: boolean;
    error: Error | undefined;
  };
}

declare module '@wasp/actions' {
  export function useAction<T, A>(action: (args: A, context: any) => Promise<T>): (args: A) => Promise<T>;
}

declare module '@wasp/core/HttpError' {
  export default class HttpError extends Error {
    constructor(statusCode: number, message?: string);
    statusCode: number;
  }
}

declare module '@wasp/auth/types' {
  export type AuthUser = {
    id: string;
    email: string;
    username: string;
    lastActiveTimestamp: Date;
    isAdmin: boolean;
    paymentProcessorUserId?: string;
    lemonSqueezyCustomerPortalUrl?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    sendNewsletter: boolean;
    datePaid?: Date;
    credits: number;
  };
}

declare module '@wasp/operations' {
  import { AuthUser } from '@wasp/auth/types';
  import { PrismaClient } from '@prisma/client';

  export type WaspContext = {
    entities: PrismaClient;
    user?: AuthUser;
  };

  export type AuthContext = {
    user: AuthUser;
  };

  export type GenericAuthenticatedOperationDefinition<TArgs = void, TReturn = unknown> = {
    args: TArgs;
    context: AuthContext;
    definition: (args: TArgs, context: WaspContext & AuthContext) => Promise<TReturn>;
  };
}

declare module '@wasp/queries/getProducts' {
  import { Product } from '@wasp/entities';
  export function getProducts(): Promise<Product[]>;
  export function getProductById(args: { id: string }): Promise<Product>;
}

declare module '@wasp/actions/productActions' {
  import { Product } from '@wasp/entities';
  import { ProductInput } from '../products/operations/types';
  
  export function createProduct(args: ProductInput): Promise<Product>;
  export function updateProduct(args: Partial<ProductInput> & { id: string }): Promise<Product>;
  export function deleteProduct(args: { id: string }): Promise<{ success: boolean }>;
}

declare module '@wasp/entities' {
  import { Prisma } from '@prisma/client';

  export type ProductStatus = 'DRAFT' | 'PUBLISHED';
  export type PricingModel = 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM';

  export type Product = Prisma.ProductGetPayload<{}>;
  export type ProductCreateInput = Prisma.ProductCreateInput;
  export type ProductUpdateInput = Prisma.ProductUpdateInput;
  export type ProductInput = Omit<ProductCreateInput, 'user' | 'userId'>;
}

declare module 'wasp/auth' {
  export function useAuth(): {
    data: import('@wasp/auth/types').AuthUser | null;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module 'wasp/client/operations' {
  export { useQuery } from '@wasp/queries';
  export { useAction } from '@wasp/actions';
}

declare module 'wasp/client/router' {
  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
  };
  export function Link(props: { to: string; children: React.ReactNode }): JSX.Element;
}

declare module 'wasp/client/auth' {
  export { useAuth } from 'wasp/auth';
  export function logout(): Promise<void>;
}

declare module '@headlessui/react' {
  export function Menu(props: any): JSX.Element;
  export function Transition(props: any): JSX.Element;
}

declare module 'react-icons/ai' {
  export const AiOutlineMenu: React.FC;
}

declare module 'react-icons/hi2' {
  export const HiMiniXMark: React.FC;
}

declare module 'react-hot-toast' {
  export function toast(message: string): void;
}

declare module 'clsx' {
  export default function clsx(...args: any[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...args: string[]): string;
}

declare module '@mui/material' {
  export const TextField: React.FC<any>;
  export const Button: React.FC<any>;
}

declare module '@mui/icons-material' {
  export const CloudUpload: React.FC;
}

declare module 'vanilla-cookieconsent' {
  export function run(config: any): void;
}

declare module '@google-analytics/data' {
  export class BetaAnalyticsDataClient {
    constructor(config: any);
    runReport(request: any): Promise<any>;
  }
}

declare module '@wasp/products/operations/types' {
  import { Product, ProductInput } from '@wasp/entities';
  import { GenericAuthenticatedOperationDefinition } from '@wasp/operations';

  export type GetProducts = GenericAuthenticatedOperationDefinition<void, Product[]>;
  export type GetProductById = GenericAuthenticatedOperationDefinition<{ id: string }, Product>;
  export type CreateProduct = GenericAuthenticatedOperationDefinition<ProductInput, Product>;
  export type UpdateProduct = GenericAuthenticatedOperationDefinition<Partial<ProductInput> & { id: string }, Product>;
  export type DeleteProduct = GenericAuthenticatedOperationDefinition<{ id: string }, { success: boolean }>;
}
