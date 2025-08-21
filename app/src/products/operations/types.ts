import { type Product, type ProductStatus, type PricingModel, type ProductInput } from '@wasp/entities'
import { type GenericAuthenticatedOperationDefinition } from '@wasp/operations'

export type GetProducts = GenericAuthenticatedOperationDefinition<void, Product[]>

export type GetProductById = GenericAuthenticatedOperationDefinition<{ id: string }, Product>

export type CreateProduct = GenericAuthenticatedOperationDefinition<ProductInput, Product>

export type UpdateProduct = GenericAuthenticatedOperationDefinition<Partial<ProductInput> & { id: string }, Product>

export type DeleteProduct = GenericAuthenticatedOperationDefinition<{ id: string }, { success: boolean }>
