/** Client-safe document id (matches Convex Id shape for dashboard types). */
export type Id<TableName extends string = string> = string & {
  __tableName: TableName;
};
