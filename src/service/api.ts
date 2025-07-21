import type { GamePreviewInfoItem } from "@/types";

type CacheEntry<T> = {
  data?: T;
  promise?: Promise<T>;
};

export const GAME_INFO_API = "https://testapi.rinshankaiho.fun/v0";

const cache = new Map<string, CacheEntry<any>>();

export const reqGameInfo = async (name: string, site: string, isCache?: boolean): Promise<GamePreviewInfoItem | null> => {
  site = site.toLowerCase();
  const key = `${name}_${site}`;
  const cached = cache.get(key) || { data: undefined, promise: undefined };

  if (cached.promise) return cached.promise;
  if (cached.data) return cached.data;

  cached.promise = await getGameInfo(name, site)
    .then((res) => {
      cached.data = res;
      return res;
    }).finally(() => {
      cached.promise = undefined;
      if (isCache) cache.delete(key);
    });

  return cached.promise;
};

const getGameInfo = async (name: string, site: string) => {
  const res = await fetch(`${GAME_INFO_API}/search?query=${name}&site=${site}`);
  const { data } = await res.json();
  return data[0];
};
