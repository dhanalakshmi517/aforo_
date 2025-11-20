declare module 'wasp/auth' {
  import { AuthUser, AuthState } from '@wasp/auth/types';
  export { AuthUser };
  export function useAuth(): AuthState;
  export function login(credentials: { email: string; password: string }): Promise<void>;
  export function signup(data: { email: string; password: string }): Promise<void>;
  export function logout(): Promise<void>;
}

declare module '@wasp/queries' {
  export type UseQueryResult<TData = unknown, TError = unknown> = {
    data: TData;
    dataUpdatedAt: number;
    error: TError | null;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: TError | null;
    isError: boolean;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isLoading: boolean;
    isLoadingError: boolean;
    isPaused: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetchError: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isSuccess: boolean;
    status: 'error' | 'loading' | 'success';
    fetchStatus: 'fetching' | 'idle' | 'paused';
    refetch: () => Promise<UseQueryResult<TData, TError>>;
    remove: () => void;
  };

  export type QueryKey = string | readonly unknown[];

  export type QueryFn<TData> = (args?: any) => Promise<TData>;

  export interface QueryOptions<TData = unknown, TError = unknown> {
    queryKey: QueryKey;
    queryFn: QueryFn<TData>;
    retry?: boolean | number;
    retryDelay?: number;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    suspense?: boolean;
    enabled?: boolean;
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
  }

  export type Query<TData = unknown, TError = unknown> = 
    | string 
    | (() => Promise<TData>) 
    | {
      queryKey: string | readonly unknown[];
      queryFn: (context: QueryFunctionContext) => Promise<TData>;
      retry?: boolean | number;
      retryDelay?: number;
      staleTime?: number;
      cacheTime?: number;
      refetchInterval?: number | false;
      refetchOnMount?: boolean;
      refetchOnWindowFocus?: boolean;
      refetchOnReconnect?: boolean;
      suspense?: boolean;
      enabled?: boolean;
      onSuccess?: (data: TData) => void;
      onError?: (error: TError) => void;
    };

  export function useQuery<TData = unknown, TError = unknown>(
    query: Query<TData, TError>,
    args?: any
  ): UseQueryResult<TData, TError>;

  export type QueryObserverLoadingErrorResult<TData = unknown, TError = unknown> = QueryObserverBaseResult<TData, TError> & {
    status: 'error';
    error: TError;
    data: undefined;
  };

  export type QueryObserverLoadingResult<TData = unknown, TError = unknown> = QueryObserverBaseResult<TData, TError> & {
    status: 'loading';
    error: null | TError;
    data: undefined;
  };

  export type QueryObserverSuccessResult<TData = unknown, TError = unknown> = QueryObserverBaseResult<TData, TError> & {
    status: 'success';
    error: null;
    data: TData;
  };

  export type QueryObserverResult<TData = unknown, TError = unknown> =
    | QueryObserverLoadingErrorResult<TData, TError>
    | QueryObserverLoadingResult<TData, TError>
    | QueryObserverSuccessResult<TData, TError>;

  export type UseQueryResult<TData = unknown, TError = unknown> = QueryObserverResult<TData, TError>;

  export type QueryKey = readonly unknown[];

  export interface QueryMetadata {
    queryKey: QueryKey;
    queryHash: string;
    options: QueryOptions<any, any>;
  }

  export interface QueryOptions<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> {
    queryKey?: QueryKey;
    queryFn?: (context: QueryFunctionContext) => Promise<TQueryFnData>;
    enabled?: boolean;
    retry?: boolean | number;
    retryDelay?: number;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    suspense?: boolean;
  }

  export interface QueryFunctionContext {
    queryKey: QueryKey;
    pageParam?: number;
  }

  export type Query<TData = unknown, TError = unknown> = QueryOptions<TData, TError> & QueryMetadata;

  export type QueryFn<TData> = (args?: any) => Promise<TData>;


  export type QueryObserverResult<TData, TError> = UseQueryResult<TData, TError>;

  
  export function useQuery<TData, TError = Error>(
    query: Query<TData, TError> | string | ((args?: any) => Promise<TData>),
  ): UseQueryResult<TData, TError>;
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
  export function getAllFilesByUser(): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      uploadUrl: string;
      downloadUrl: string;
      createdAt: Date;
      userId: string;
      key: string;
    }>;
    length: number;
    message?: string;
  }>;
  export function getDownloadFileSignedURL(key: string): Promise<string>;
  export function createFile(file: File | { fileType: string; name: string; size: number }, options?: { onUploadProgress?: (progress: number) => void }): Promise<{ uploadUrl: string; status?: string; error?: string; data?: any }>;
  export function generateCheckoutSession(planId?: string): Promise<{ sessionUrl: string }>;
  export function getCustomerPortalUrl(): Promise<string>;
}

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

  export type { AuthUser as default };

  export type AuthUserSignupFields = Omit<AuthUser, 'id' | 'lastActiveTimestamp'> & {
    password: string;
  };

  export interface AuthContext {
    user: AuthUser;
  }

  export interface AuthState {
    data: AuthUser | null;
    isLoading: boolean;
    error: Error | null;
  }

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
  import { AuthUser, AuthState } from '@wasp/auth/types';
  export function useAuth(): AuthState;
  export { AuthUser };
  export function login(credentials: { email: string; password: string }): Promise<void>;
  export function signup(data: { email: string; password: string }): Promise<void>;
  export function logout(): Promise<void>;
}

declare module 'wasp/client/operations' {
  export { useQuery } from '@wasp/queries';
  export { useAction } from '@wasp/actions';
}

declare module 'wasp/client/router' {
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
  export interface CookieConsentConfig {
    current_lang?: string;
    autoclear_cookies?: boolean | {
      cookies: Array<{
        name: string | RegExp;
        domain?: string;
        path?: string;
      }>;
    };
    page_scripts?: boolean;
    mode?: 'opt-in' | 'opt-out';
    delay?: number;
    auto_language?: string;
    autorun?: boolean;
    force_consent?: boolean;
    hide_from_bots?: boolean;
    remove_cookie_tables?: boolean;
    cookie_name?: string;
    cookie_expiration?: number;
    cookie_necessary_only_expiration?: number;
    cookie_domain?: string;
    cookie_path?: string;
    cookie_same_site?: 'Lax' | 'None' | 'Strict';
    use_rfc_cookie?: boolean;
    revision?: number;
    consent_modal?: {
      title?: string;
      description?: string;
      acceptAllBtn?: string;
      acceptNecessaryBtn?: string;
      showPreferencesBtn?: string;
      primary_btn?: {
        text?: string;
        role?: 'accept_all' | 'accept_selected';
      };
      secondary_btn?: {
        text?: string;
        role?: 'accept_necessary' | 'settings';
      };
    };
    settings_modal?: {
      title?: string;
      save_settings_btn?: string;
      accept_all_btn?: string;
      reject_all_btn?: string;
      close_btn_label?: string;
      blocks?: Array<{
        title?: string;
        description?: string;
        toggle?: {
          value?: string;
          enabled?: boolean;
          readonly?: boolean;
        };
      }>;
    };
    autoclear_cookies?: boolean | {
      cookies: Array<{
        name: string | RegExp;
        domain?: string;
        path?: string;
      }>;
    };
    consent_modal: {
      title: string;
      description: string;
      primary_btn: {
        text: string;
        role: 'accept_all' | 'accept_selected';
      };
      secondary_btn?: {
        text: string;
        role: 'accept_necessary' | 'settings';
      };
      revision_message?: string;
    };
    settings_modal: {
      title: string;
      save_settings_btn: string;
      accept_all_btn: string;
      reject_all_btn?: string;
      close_btn_label?: string;
      cookie_table_headers?: Array<{
        col1?: string;
        col2?: string;
        col3?: string;
      }>;
      blocks: Array<{
        title: string;
        description: string;
        toggle?: {
          value: string;
          enabled: boolean;
          readonly?: boolean;
        };
      }>;
    };

    autoclear_cookies?: boolean | {
      cookies: Array<{
        name: string | RegExp;
        domain?: string;
        path?: string;
      }>;
    };
    consent_modal?: {
      title?: string;
      description?: string;
      primary_btn?: {
        text?: string;
        role?: 'accept_all' | 'accept_selected';
      };
      secondary_btn?: {
        text?: string;
        role?: 'accept_necessary' | 'settings';
      };
      acceptAllBtn?: string;
      acceptNecessaryBtn?: string;
      showPreferencesBtn?: string;
    };
    settings_modal?: {
      title?: string;
      save_settings_btn?: string;
      accept_all_btn?: string;
      reject_all_btn?: string;
      close_btn_label?: string;
      blocks?: Array<{
        title?: string;
        description?: string;
        toggle?: {
          value?: string;
          enabled?: boolean;
          readonly?: boolean;
        };
      }>;
    };
    
    autoclear_cookies: boolean | {
      cookies: Array<{
        name: string | RegExp;
        domain?: string;
        path?: string;
      }>;
    };
    consent_modal: {
      title: string;
      description: string;
      acceptAllBtn?: string;
      acceptNecessaryBtn?: string;
      showPreferencesBtn?: string;
    };
    settings_modal: {
      title: string;
      acceptAllBtn?: string;
      acceptNecessaryBtn?: string;
      savePreferencesBtn?: string;
      sections: Array<{
        title: string;
        description: string;
      }>;
    };
    
    autoclear_cookies?: boolean | {
      cookies?: Array<{
        name: string | RegExp;
        domain?: string;
        path?: string;
      }>;
    };
    page_scripts?: boolean;
    mode?: 'opt-in' | 'opt-out';
    delay?: number;
    auto_language?: string;
    autorun?: boolean;
    force_consent?: boolean;
    hide_from_bots?: boolean;
    remove_cookie_tables?: boolean;
    cookie?: {
      name?: string;
      domain?: string;
      path?: string;
      sameSite?: 'Lax' | 'None' | 'Strict';
      expiresAfterDays?: number;
    };
    gui_options?: {
      consent_modal?: {
        layout?: 'box' | 'cloud' | 'bar';
        position?: 'bottom' | 'middle' | 'top';
        transition?: 'slide' | 'zoom';
        swap_buttons?: boolean;
      };
      settings_modal?: {
        layout?: 'box' | 'bar';
        position?: 'left' | 'right';
        transition?: 'slide' | 'zoom';
      };
    };
    languages?: {
      [key: string]: {
        consent_modal?: {
          title?: string;
          description?: string;
          acceptAllBtn?: string;
          acceptNecessaryBtn?: string;
          showPreferencesBtn?: string;
          primary_btn?: {
            text?: string;
            role?: 'accept_all' | 'accept_selected';
          };
          secondary_btn?: {
            text?: string;
            role?: 'accept_necessary' | 'settings';
          };
        };
        settings_modal?: {
          title?: string;
          save_settings_btn?: string;
          accept_all_btn?: string;
          reject_all_btn?: string;
          close_btn_label?: string;
          cookie_table_headers?: Array<{
            col1?: string;
            col2?: string;
            col3?: string;
            col4?: string;
          }>;
          blocks?: Array<{
            title?: string;
            description?: string;
            toggle?: {
              value?: string;
              enabled?: boolean;
              readonly?: boolean;
            };
          }>;
        };
      };
    };
    
    root?: string;
    autoShow?: boolean;
    disablePageInteraction?: boolean;
    hideFromBots?: boolean;
    mode?: 'opt-in' | 'opt-out';
    revision?: number;
    cookie?: {
      name?: string;
      domain?: string;
      path?: string;
      sameSite?: string;
      expiresAfterDays?: number;
    };
    guiOptions?: {
      consentModal?: {
        layout?: string;
        position?: string;
        equalWeightButtons?: boolean;
        flipButtons?: boolean;
      };
      preferencesModal?: {
        layout?: string;
        position?: string;
        equalWeightButtons?: boolean;
        flipButtons?: boolean;
      };
    };
    categories?: {
      [key: string]: {
        enabled?: boolean;
        readOnly?: boolean;
        autoClear?: boolean;
        services?: {
          [key: string]: {
            label?: string;
            onAccept?: () => void;
            onReject?: () => void;
          };
        };
      };
    };
    language?: {
      default?: string;
      translations?: {
        [key: string]: {
          consentModal?: {
            title?: string;
            description?: string;
          };
          preferencesModal?: {
            title?: string;
            acceptAllBtn?: string;
            acceptNecessaryBtn?: string;
            savePreferencesBtn?: string;
            closeIconLabel?: string;
            sections?: Array<{
              title?: string;
              description?: string;
            }>;
          };
        };
      };
    };
    current_lang?: string;
    autoclear_cookies?: boolean;
    page_scripts?: boolean;
    mode?: 'opt-in' | 'opt-out';
    delay?: number;
    auto_language?: string;
    autorun?: boolean;
    force_consent?: boolean;
    hide_from_bots?: boolean;
    remove_cookie_tables?: boolean;
    cookie_name?: string;
    cookie_expiration?: number;
    cookie_necessary_only_expiration?: number;
    cookie_domain?: string;
    cookie_path?: string;
    cookie_same_site?: 'Lax' | 'None' | 'Strict';
    use_rfc_cookie?: boolean;
    revision?: number;
    [key: string]: any;
  }
  export function run(config: CookieConsentConfig): void;
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
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'caption';
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
  }> & { sx?: any; };
  export const CardActions: React.FC<{
    children: React.ReactNode;
    className?: string;
  }>;
  export const Chip: React.FC<{
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
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
    value: any;
    children?: React.ReactNode;
    label: string;
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
    value: any;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
  export const Button: React.FC<{
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
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
  export const TextField: React.FC<{
    variant?: 'standard' | 'filled' | 'outlined';
    label?: string;
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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

declare module 'react-icons/ai' {
  export const AiOutlineMenu: React.FC<{ className?: string; 'aria-hidden'?: string }>;
  export const AiFillCloseCircle: React.FC<{ className?: string; 'aria-hidden'?: string }>;
  export const AiFillCheckCircle: React.FC<{ className?: string; 'aria-hidden'?: string }>;
}

declare module 'react-icons/hi2' {
  export const HiBars3: React.FC<{ className?: string; 'aria-hidden'?: string }>;
  export const HiMiniXMark: React.FC<{ className?: string; 'aria-hidden'?: string }>;
}

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

declare module '@wasp/products/operations/types' {
  import { Product, ProductInput } from '@wasp/entities';
  import { GenericAuthenticatedOperationDefinition } from '@wasp/operations';

  export type GetProducts = GenericAuthenticatedOperationDefinition<void, Product[]>;
  export type GetProductById = GenericAuthenticatedOperationDefinition<{ id: string }, Product>;
  export type CreateProduct = GenericAuthenticatedOperationDefinition<ProductInput, Product>;
  export type UpdateProduct = GenericAuthenticatedOperationDefinition<Partial<ProductInput> & { id: string }, Product>;
  export type DeleteProduct = GenericAuthenticatedOperationDefinition<{ id: string }, { success: boolean }>;
}