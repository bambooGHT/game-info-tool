import { ImgProxy, Search, type ImgProxyType, type RouteType, type SearchResult, type SearchType } from "./types";
import websites from "./service/websiteCrawlers";
import type { FastifyRequest } from "fastify";
import axios from "axios";

export const routes: RouteType[] = [
  {
    method: "GET",
    url: "/search",
    schema: {
      querystring: Search
    },
    handler: async (req: FastifyRequest<{ Querystring: SearchType; }>, res) => {
      const { text, website } = req.query;
      console.log(`${`website: ${website}`.padEnd(18, " ")}search: ${text}`);
      const result: SearchResult = {
        success: true,
        data: null,
        message: "ok"
      };
      if (!text.trim().length) {
        result.success = false;
        result.message = "name cannot be empty";
        return result;
      }

      const data = await websites[website](text.trim());
      if (!data.length) result.message = "no result";
      result.data = data;
      return result;
    }
  },
  {
    method: "GET",
    url: "/imgProxy",
    schema: {
      querystring: ImgProxy
    },
    handler: async (req: FastifyRequest<{ Querystring: ImgProxyType; }>, res) => {
      const { url } = req.query;
      const headers = url.includes("img.achost.top") ? { "Referer": "https://2dfan.com" } : {};
      const response = await axios.get(url, {
        responseType: 'stream',
        headers
      });

      return response.data;
    }
  }
];