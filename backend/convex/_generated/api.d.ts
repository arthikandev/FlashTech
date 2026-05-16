/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as businessMembers from "../businessMembers.js";
import type * as businesses from "../businesses.js";
import type * as conversations from "../conversations.js";
import type * as intelligence from "../intelligence.js";
import type * as lib_auth from "../lib/auth.js";
import type * as seed from "../seed.js";
import type * as triggers from "../triggers.js";
import type * as visitors from "../visitors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  businessMembers: typeof businessMembers;
  businesses: typeof businesses;
  conversations: typeof conversations;
  intelligence: typeof intelligence;
  "lib/auth": typeof lib_auth;
  seed: typeof seed;
  triggers: typeof triggers;
  visitors: typeof visitors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
