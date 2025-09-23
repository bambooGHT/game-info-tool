import type { GamePreviewInfoItem } from "@/types";

type CacheEntry<T> = {
  data?: T;
  promise?: Promise<T>;
};

let apiConfig = {
  baseURL: "",
  dlsiteCookie: ""
};

export const updateApiConfig = (config: Partial<typeof apiConfig>) => {
  apiConfig = { ...apiConfig, ...config };
};
const cache = new Map<string, CacheEntry<GamePreviewInfoItem[] | null>>();

export const reqGameInfo = async (name: string, site: string, isCache?: boolean): Promise<GamePreviewInfoItem[] | null> => {
  const key = `${name}_${site}`;
  const cached = cache.get(key) || { data: undefined, promise: undefined };

  if (cached.promise) return cached.promise;
  if (cached.data) return cached.data;

  cached.promise = await getGameInfo(name, site)
    .then((res) => {
      cached.data = res;
      return res;
    })
    .catch((error) => {
      console.error("请求游戏信息失败:", error);
      cached.data = null;
      return null;
    })
    .finally(() => {
      cached.promise = undefined;
      if (isCache) cache.delete(key);
    });

  return cached.promise!;
};

const getGameInfo = async (name: string, site: string) => {
  const res = await fetch(`${apiConfig.baseURL}/search?text=${name}&website=${site}`, {
    method: 'GET',
    headers: {
      "DLsite-Cookie": apiConfig.dlsiteCookie
    },

  });
  const { data } = await res.json();
  return data;
};
