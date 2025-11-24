// @ts-nocheck
// app/patch-useAuth.ts
// This file is used to override .wasp/out/sdk/wasp/auth/useAuth.ts
// It keeps runtime logic the same but relaxes types so Wasp 0.19 + TS + TanStack stop fighting.

import { deserialize } from 'wasp/core/serialization'
import { useQuery, buildAndRegisterQuery } from 'wasp/client/operations'
import { api, handleApiError } from 'wasp/client/api'
import { HttpMethod } from 'wasp/client'
import type { AuthUserData } from '../server/auth/user.js'
import { makeAuthUserIfPossible } from '../auth/user.js'

// PUBLIC API
export const getMe = createUserGetter()

// PUBLIC API
export default function useAuth() {
  return useQuery(getMe)
}

function createUserGetter() {
  const getMeRelativePath = 'auth/me'
  const getMeRoute = { method: HttpMethod.Get, path: `/${getMeRelativePath}` }

  const getMe = async () => {
    try {
      const response = await api.get(getMeRoute.path)
      const userData = deserialize<AuthUserData | null>(response.data)
      return makeAuthUserIfPossible(userData)
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // We loosen types with "any" so TS stops complaining about React Query internals.
  return (buildAndRegisterQuery as any)(getMe as any, {
    queryCacheKey: [getMeRelativePath],
    queryRoute: getMeRoute,
    entitiesUsed: ['User'],
  }) as any
}
