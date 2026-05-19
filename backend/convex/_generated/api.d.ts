/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as billing from "../billing.js";
import type * as businessMembers from "../businessMembers.js";
import type * as businesses from "../businesses.js";
import type * as categories from "../categories.js";
import type * as categoryStats from "../categoryStats.js";
import type * as clients from "../clients.js";
import type * as connectors from "../connectors.js";
import type * as conversations from "../conversations.js";
import type * as embed from "../embed.js";
import type * as industryDefaults from "../industryDefaults.js";
import type * as intelligence from "../intelligence.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_categoriesData from "../lib/categoriesData.js";
import type * as lib_ensureCategoriesSeeded from "../lib/ensureCategoriesSeeded.js";
import type * as lib_webhookUrls from "../lib/webhookUrls.js";
import type * as triggers from "../triggers.js";
import type * as usage from "../usage.js";
import type * as visitors from "../visitors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  billing: typeof billing;
  businessMembers: typeof businessMembers;
  businesses: typeof businesses;
  categories: typeof categories;
  categoryStats: typeof categoryStats;
  clients: typeof clients;
  connectors: typeof connectors;
  conversations: typeof conversations;
  embed: typeof embed;
  industryDefaults: typeof industryDefaults;
  intelligence: typeof intelligence;
  "lib/auth": typeof lib_auth;
  "lib/categoriesData": typeof lib_categoriesData;
  "lib/ensureCategoriesSeeded": typeof lib_ensureCategoriesSeeded;
  "lib/webhookUrls": typeof lib_webhookUrls;
  triggers: typeof triggers;
  usage: typeof usage;
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
