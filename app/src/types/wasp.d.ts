// ---- wasp/auth + auth types -----------------------------------

declare module '@wasp/auth/types' {
  export interface AuthUser {
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
  }

  export interface AuthState {
    data: AuthUser | null;
    isLoading: boolean;
    error: Error | null;
  }

  export type AuthUserSignupFields = Omit<AuthUser, 'id' | 'lastActiveTimestamp'> & {
    password: string;
  };

  export interface AuthContext {
    user: AuthUser;
  }
}

declare module 'wasp/auth' {
  import type { AuthUser, AuthState } from '@wasp/auth/types';

  export type { AuthUser };

  export function useAuth(): AuthState;

  export function login(credentials: {
    email: string;
    password: string;
  }): Promise<void>;

  export function signup(data: {
    email: string;
    password: string;
  }): Promise<void>;

  export function logout(): Promise<void>;
}

// ---- @wasp/queries (use React Query types) --------------------

declare module '@wasp/queries' {
  export type UseQueryResult<TData = unknown, TError = unknown> = {
    data: TData | undefined;
    error: TError | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    status: 'error' | 'loading' | 'success';
    refetch: () => Promise<void>;
    errorUpdateCount: number;
    isInitialLoading: boolean;
    isLoadingError: boolean;
    isRefetchError: boolean;
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    fetchStatus: 'fetching' | 'idle' | 'paused';
    failureCount: number;
    failureReason: TError | null;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isPaused: boolean;
    remove: () => void;
  };

  export type QueryFn<TData = unknown, TArgs = void> = (args: TArgs) => Promise<TData>;

  export type QueryMetadata = {
    queryKey: string | readonly unknown[];
    queryHash: string;
    options: any;
  };

  export type Query<TArgs = void, TData = unknown> = string | QueryFn<TData, TArgs> | QueryMetadata;

  export interface QueryOptions<TData = unknown, TError = unknown> {
    enabled?: boolean;
    retry?: boolean | number;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }

  export function useQuery<TData = unknown, TError = unknown>(
    query: Query<void, TData>,
    args?: undefined
  ): UseQueryResult<TData, TError>;

  // Overload for functions with args
  export function useQuery<TArgs = any, TData = unknown, TError = unknown>(
    query: QueryFn<TData, TArgs>,
    args: TArgs
  ): UseQueryResult<TData, TError>;

  // Actual implementation (not visible to consuming code)
  export function useQuery<TArgs = any, TData = unknown, TError = unknown>(
    query: Query<TArgs, TData>,
    args?: TArgs
  ): UseQueryResult<TData, TError>;
}

// ---- @wasp/actions --------------------------------------------

declare module '@wasp/actions' {
  export function useAction<T, A>(
    action: (args: A, context: any) => Promise<T>,
  ): (args: A) => Promise<T>;
}

// ---- small utility modules ------------------------------------

declare module 'clsx' {
  export type ClassValue =
    | string
    | number
    | boolean
    | undefined
    | null
    | { [key: string]: any }
    | ClassValue[];

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

// ---- wasp/client/operations -----------------------------------

declare module 'wasp/client/operations' {
  import type { QueryFn } from '@wasp/queries';

  export { useQuery } from '@wasp/queries';
  export { useAction } from '@wasp/actions';

  // Real usage: buildAndRegisterQuery(async () => {...})
  export function buildAndRegisterQuery<TData = unknown, TArgs = void>(
    queryFn: QueryFn<TData, TArgs>,
  ): QueryFn<TData, TArgs>;

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

  export function getAllFilesByUser(): Promise<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    uploadUrl: string;
    downloadUrl: string;
    createdAt: Date;
    userId: string;
    key: string;
  }>>;

  export function getDownloadFileSignedURL(
    key: string
  ): Promise<string>;

  // Loosened – you were passing { fileType, name } without size.
  export function createFile(
    file: File | { fileType: string; name: string; size?: number },
    options?: { onUploadProgress?: (progress: number) => void }
  ): Promise<{ uploadUrl: string; status: string; error?: string; data?: any }>;

  export function generateCheckoutSession(
    planId?: string,
  ): Promise<{ sessionUrl: string }>;

  export function getCustomerPortalUrl(): Promise<string>;
}

// ---- @wasp/operations -----------------------------------------

declare module '@wasp/operations' {
  import type { AuthUser } from '@wasp/auth/types';
  import type { PrismaClient } from '@prisma/client';

  export type WaspContext = {
    entities: PrismaClient;
    user?: AuthUser;
  };

  export type AuthContext = {
    user: AuthUser;
  };

  export type GenericAuthenticatedOperationDefinition<
    TArgs = void,
    TReturn = unknown,
  > = {
    args: TArgs;
    context: AuthContext;
    definition: (args: TArgs, context: WaspContext & AuthContext) => Promise<TReturn>;
  };
}

// ---- products-related ops/entities ----------------------------

declare module '@wasp/entities' {
  import type { Prisma } from '@prisma/client';

  export type ProductStatus = 'DRAFT' | 'PUBLISHED';
  export type PricingModel = 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM';

  export type Product = Prisma.ProductGetPayload<{}>;
  export type ProductCreateInput = Prisma.ProductCreateInput;
  export type ProductUpdateInput = Prisma.ProductUpdateInput;
  export type ProductInput = Omit<ProductCreateInput, 'user' | 'userId'>;
}

declare module '@wasp/queries/getProducts' {
  import type { Product } from '@wasp/entities';

  export function getProducts(): Promise<Product[]>;
  export function getProductById(args: { id: string }): Promise<Product>;
}

declare module '@wasp/actions/productActions' {
  import type { Product } from '@wasp/entities';
  import type { ProductInput } from '@wasp/entities';

  export function createProduct(args: ProductInput): Promise<Product>;
  export function updateProduct(
    args: Partial<ProductInput> & { id: string },
  ): Promise<Product>;
  export function deleteProduct(
    args: { id: string },
  ): Promise<{ success: boolean }>;
}

declare module '@wasp/products/operations/types' {
  import type { Product, ProductInput } from '@wasp/entities';
  import type { GenericAuthenticatedOperationDefinition } from '@wasp/operations';

  export type GetProducts = GenericAuthenticatedOperationDefinition<void, Product[]>;
  export type GetProductById = GenericAuthenticatedOperationDefinition<
    { id: string },
    Product
  >;
  export type CreateProduct = GenericAuthenticatedOperationDefinition<
    ProductInput,
    Product
  >;
  export type UpdateProduct = GenericAuthenticatedOperationDefinition<
    Partial<ProductInput> & { id: string },
    Product
  >;
  export type DeleteProduct = GenericAuthenticatedOperationDefinition<
    { id: string },
    { success: boolean }
  >;
}

// ---- wasp/client/router & client/auth -------------------------

declare module 'wasp/client/router' {
  import * as React from 'react';

  type RouteConfig = {
    to: string;
  };

  export const routes: {
    auth: {
      login: RouteConfig & { to: '/auth/login' };
      signup: RouteConfig & { to: '/auth/signup' };
      emailVerification: RouteConfig & { to: '/auth/email-verification' };
      passwordReset: RouteConfig & { to: '/auth/password-reset' };
      requestPasswordReset: RouteConfig & { to: '/auth/request-password-reset' };
    };
    dashboard: RouteConfig & { to: '/dashboard' };
    products: RouteConfig & { to: '/products' };
    messages: RouteConfig & { to: '/messages' };
    settings: RouteConfig & { to: '/settings' };
    account: RouteConfig & { to: '/account' };
    AdminRoute: RouteConfig & { to: '/admin' };
    LoginRoute: RouteConfig & { to: '/auth/login' };
    AccountRoute: RouteConfig & { to: '/account' };
    AdminMessagesRoute: RouteConfig & { to: '/admin/messages' };
    LandingPageRoute: RouteConfig & { to: '/' };
    AdminDashboardRoute: RouteConfig & { to: '/admin/dashboard' };
  };

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

// ---- Headless UI & icons --------------------------------------

declare module '@headlessui/react' {
  export const Dialog: React.FC<{
    open: boolean;
    onClose: (value: boolean) => void;
    children: React.ReactNode;
    className?: string;
    as?: string;
    'aria-hidden'?: string;
  }> & {
    Panel: React.FC<{
      children: React.ReactNode;
      className?: string;
      'aria-hidden'?: string;
    }>;
    Overlay: React.FC<{
      className?: string;
      'aria-hidden'?: string;
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

declare module 'react-icons/ai' {
  export const AiOutlineMenu: React.FC<{ className?: string; 'aria-hidden'?: string }>;
  export const AiFillCloseCircle: React.FC<{
    className?: string;
    'aria-hidden'?: string;
  }>;
  export const AiFillCheckCircle: React.FC<{
    className?: string;
    'aria-hidden'?: string;
  }>;
}

declare module 'react-icons/hi2' {
  export const HiBars3: React.FC<{ className?: string; 'aria-hidden'?: string }>;
  export const HiMiniXMark: React.FC<{ className?: string; 'aria-hidden'?: string }>;
}

// ---- vanilla-cookieconsent (loosened) -------------------------

declare module 'vanilla-cookieconsent' {
  // Keep this ultra-flexible to avoid fighting the lib’s config shape.
  export interface CookieConsentConfig {
    [key: string]: any;
  }

  export function run(config: CookieConsentConfig): void;
}

// ---- Google Analytics Data ------------------------------------

declare module '@google-analytics/data' {
  export class BetaAnalyticsDataClient {
    constructor(config: any);
    runReport(request: any): Promise<any>;
  }
}

// ---- MUI stubs ------------------------------------------------

declare module '@mui/material' {
  import * as React from 'react';

  export const Box: React.FC<{
    children: React.ReactNode;
    className?: string;
    component?: string;
    sx?: any;
    display?: string;
    flexDirection?: string;
    height?: string;
    flexGrow?: number;
    mt?: number;
    mb?: number;
    textAlign?: string;
    [key: string]: any;
  }>;

  export const Typography: React.FC<{
    variant?:
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6'
      | 'body1'
      | 'body2'
      | 'subtitle1'
      | 'caption';
    component?: string;
    className?: string;
    children: React.ReactNode;
    color?: string;
    gutterBottom?: boolean;
    paragraph?: boolean;
    sx?: any;
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
    pt?: number;
    pb?: number;
    pl?: number;
    pr?: number;
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
    sx?: any;
  }>;

  export const CardContent: React.FC<{
    children: React.ReactNode;
    sx?: any;
    className?: string;
  }>;

  export const CardActions: React.FC<{
    children: React.ReactNode;
    className?: string;
  }>;

  export const Chip: React.FC<{
    label: string;
    color?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
    size?: 'small' | 'medium';
    className?: string;
  }>;

  export const CircularProgress: React.FC<{
    size?: number;
    color?: 'inherit' | 'primary' | 'secondary';
    className?: string;
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
    value?: any;
    label?: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
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
    sx?: any;
    className?: string;
    display?: string;
    flexDirection?: string;
    height?: string;
    flexGrow?: number;
  }>;

  export const List: React.FC<{
    children: React.ReactNode;
  }>;

  export const ListItem: React.FC<{
    children: React.ReactNode;
    className?: string;
    secondaryAction?: React.ReactNode;
    key?: any;
    sx?: any;
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
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'standard' | 'scrollable' | 'fullWidth';
  }>;

  export const Tab: React.FC<{
    label: string;
    value?: any;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;

  export const Button: React.FC<{
    variant?: 'text' | 'outlined' | 'contained';
    color?:
      | 'inherit'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'error'
      | 'info'
      | 'warning';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    sx?: any;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    component?: React.ElementType;
    href?: string;
  }>;

  // IMPORTANT: keep onChange very loose to avoid TextField handler type clashes.
  export const TextField: React.FC<{
    variant?: 'standard' | 'filled' | 'outlined';
    label?: string;
    value?: string | number;
    onChange?: (event: any) => void;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
    type?: string;
    multiline?: boolean;
    rows?: number;
    disabled?: boolean;
    placeholder?: string;
    name?: string;
    required?: boolean;
    sx?: any;
    InputProps?: {
      startAdornment?: React.ReactNode;
      endAdornment?: React.ReactNode;
      [key: string]: any;
    };
  }>;

  export const Divider: React.FC<{
    orientation?: 'horizontal' | 'vertical';
    variant?: 'fullWidth' | 'inset' | 'middle';
    light?: boolean;
    sx?: any;
  }>;
}

declare module '@mui/icons-material' {
  export const CloudUpload: React.FC;
  export const Description: React.FC;
  export const Download: React.FC;
  export const Delete: React.FC;
}
