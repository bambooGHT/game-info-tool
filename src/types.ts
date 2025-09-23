import { Type, type Static } from "@sinclair/typebox";
import type { FastifySchema, RouteGenericInterface, RouteHandler } from "fastify";

export type RouteType<T extends RouteGenericInterface = any> = {
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string;
  schema?: FastifySchema;
  handler: RouteHandler<T>;
};

export type SearchResult = {
  success: boolean;
  data: any;
  message: string;
};

export const Search = Type.Object({
  text: Type.String(),
  website: Type.Union([
    Type.Literal("2DFan"),
    Type.Literal("DLsite"),
  ])
});

export const ImgProxy = Type.Object({
  url: Type.String(),
});

export type SearchType = Static<typeof Search>;
export type ImgProxyType = Static<typeof ImgProxy>;


export interface RouteContext {
  "dlsite-cookie": string;
}