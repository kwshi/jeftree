export * as Node from "./node";
import type * as Node from "./node";

export interface Position {
  readonly offset: number;
  readonly row: number;
  readonly column: number;
}

export interface Range {
  readonly start: Position;
  readonly end: Position;
}

export type Root = readonly Node.Node[];
