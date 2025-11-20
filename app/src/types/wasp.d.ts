declare module 'wasp/auth' {
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

  export function useAuth(): {
    data: AuthUser | null;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@wasp/queries' {
  export type UseQueryResult<T> = {
    data: T | undefined;
    isLoading: boolean;
    error: Error | undefined;
    refetch: () => void;
  };
  
  export function useQuery<T, A>(query: (args: A, context: any) => Promise<T>, args?: A): UseQueryResult<T>;
}

declare module '@wasp/actions' {
  export function useAction<T, A>(action: (args: A, context: any) => Promise<T>): (args: A) => Promise<T>;
}

declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];
  export default function clsx(...inputs: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...classLists: string[]): string;
}

declare module 'react-hot-toast' {
  export function toast(message: string): void;
  export const success: (message: string) => void;
  export const error: (message: string) => void;
}

declare module '@wasp/core/HttpError' {
  export default class HttpError extends Error {
    constructor(statusCode: number, message?: string);
    statusCode: number;
  }
}

declare module 'wasp/client/operations' {
  export { useQuery } from '@wasp/queries';
  export { useAction } from '@wasp/actions';
  export function buildAndRegisterQuery<T>(name: string, query: () => Promise<T>): () => Promise<T>;
  export function updateIsUserAdminById(id: string): Promise<void>;
  export function getPaginatedUsers(args: {
    skip: number;
    emailContains?: string;
    isAdmin?: boolean;
    subscriptionStatus?: string[];
  }): Promise<{
    users: any[];
    totalPages: number;
  }>;
  export function getAllFilesByUser(): Promise<any[]>;
  export function getDownloadFileSignedURL(key: string): Promise<string>;
  export function createFile(file: File): Promise<void>;
  export function generateCheckoutSession(): Promise<void>;
  export function getCustomerPortalUrl(): Promise<string>;
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
  export const routes = {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      emailVerification: '/auth/email-verification',
      passwordReset: '/auth/password-reset',
      requestPasswordReset: '/auth/request-password-reset'
    },
    dashboard: '/dashboard',
    products: '/products',
    messages: '/messages',
    settings: '/settings',
    account: '/account',
    AdminRoute: '/admin',
    LoginRoute: '/auth/login',
    AccountRoute: '/account',
    AdminMessagesRoute: '/admin/messages',
    LandingPageRoute: '/',
    AdminDashboardRoute: '/admin/dashboard'
  } as const;

  export function Link(props: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }): JSX.Element;

  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
  };
}

declare module 'wasp/client/auth' {
  export { useAuth } from 'wasp/auth';
  export function logout(): Promise<void>;
  export const LoginForm: React.FC;
  export const SignupForm: React.FC;
  export const VerifyEmailForm: React.FC;
  export const ResetPasswordForm: React.FC;
  export const ForgotPasswordForm: React.FC;
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






declare module 'vanilla-cookieconsent' {
  export function run(config: any): void;
}

declare module '@google-analytics/data' {
  export class BetaAnalyticsDataClient {
    constructor(config: any);
    runReport(request: any): Promise<any>;
  }
}

declare module '@mui/material' {
  export const Box: React.FC<{
    children: React.ReactNode;
    className?: string;
    component?: string;
    sx?: any;
    [key: string]: any;
  }>;
  export const Typography: React.FC<{
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'caption';
    component?: string;
    className?: string;
    children: React.ReactNode;
    color?: string;
    gutterBottom?: boolean;
    paragraph?: boolean;
    sx?: any;
  }>;
  export const Grid: React.FC<{
    container?: boolean;
    item?: boolean;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    spacing?: number;
    className?: string;
    children: React.ReactNode;
    sx?: any;
  }>;
  export const Card: React.FC<{
    className?: string;
    children: React.ReactNode;
  }>;
  export const CardContent: React.FC<{
    children: React.ReactNode;
  }>;
  export const CardActions: React.FC<{
    children: React.ReactNode;
  }>;
  export const Chip: React.FC<{
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    size?: 'small' | 'medium';
  }>;
  export const CircularProgress: React.FC<{
    size?: number;
    color?: 'inherit' | 'primary' | 'secondary';
  }>;
  export const Alert: React.FC<{
    severity?: 'error' | 'warning' | 'info' | 'success';
    children: React.ReactNode;
    sx?: any;
  }>;
  export const FormControl: React.FC<{
    fullWidth?: boolean;
    children: React.ReactNode;
    error?: boolean;
  }>;
  export const InputLabel: React.FC<{
    id?: string;
    children: React.ReactNode;
  }>;
  export const Select: React.FC<{
    value: any;
    onChange: (event: any) => void;
    children: React.ReactNode;
    label?: string;
    name?: string;
    error?: boolean;
    onBlur?: () => void;
    disabled?: boolean;
  }>;
  export const MenuItem: React.FC<{
    value: any;
    children: React.ReactNode;
  }>;
  export const Paper: React.FC<{
    elevation?: number;
    className?: string;
    children: React.ReactNode;
    sx?: any;
  }>;
  export const Container: React.FC<{
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
  }>;
  export const List: React.FC<{
    children: React.ReactNode;
  }>;
  export const ListItem: React.FC<{
    children: React.ReactNode;
    className?: string;
    secondaryAction?: React.ReactNode;
    key?: any;
  }>;
  export const ListItemText: React.FC<{
    primary: React.ReactNode;
    secondary?: React.ReactNode;
  }>;
  export const ListItemIcon: React.FC<{
    children: React.ReactNode;
  }>;
  export const Tabs: React.FC<{
    value: any;
    onChange: (event: any, value: any) => void;
    children: React.ReactNode;
  }>;
  export const Tab: React.FC<{
    label: string;
    value: any;
  }>;
}

declare module '@mui/icons-material' {
  export const CloudUpload: React.FC;
  export const Description: React.FC;
  export const Download: React.FC;
  export const Delete: React.FC;
}

declare module 'react-icons/ai' {
  export const AiOutlineMenu: React.FC;
  export const AiFillCloseCircle: React.FC;
  export const AiFillCheckCircle: React.FC;
}

declare module 'react-icons/hi2' {
  export const HiBars3: React.FC;
  export const HiMiniXMark: React.FC;
}

declare module '@headlessui/react' {
  export const Dialog: React.FC<{
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    'aria-hidden'?: string;
  }> & {
    Panel: React.FC<{
      children: React.ReactNode;
      className?: string;
    }>;
  };
  export const Menu: React.FC<{
    children: React.ReactNode;
  }>;
  export const Transition: React.FC<{
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children: React.ReactNode;
  }>;
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
