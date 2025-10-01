import type { GameInfo, GameTags } from "@/types";
import { gameTagKeys } from "./defaultData";

export const filterTags = (rawTag: string[], filterTag: string[]) => {
  return new Set(rawTag.filter(item => filterTag.includes(item)));
};

export const excludeTags = (rawTag: string[], excludeTag: string[]) => {
  const result = new Set(rawTag);
  excludeTag.forEach(item => {
    result.delete(item);
  });

  return result;
};

export const serializeInfo = (obj: GameInfo | GameTags) => {
  const result = structuredClone(obj) as any;
  gameTagKeys.forEach(key => {
    result[key] = [...result[key]];
  });

  return result;
};

export const deserializeInfo = (obj: GameInfo | GameTags) => {
  const result = structuredClone(obj) as any;
  gameTagKeys.forEach(key => {
    result[key] = new Set(result[key]);
  });

  return result;
};