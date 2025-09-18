import { SearchStatus } from "@/enums";
import { reqGameInfo, updateApiUrl } from "@/services/api";
import type { GameInfo, GameInfoSourceSite, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags, ConfigData } from "@/types";
import { reactive, ref } from "vue";
import { defaultGameTags, defaultGameInfo, siteNames } from "./defaultData";
import { preprocessGameInfoData } from "./preprocessGameInfoData";

export const SearchText = ref("");
export const gameInfoSourceSite = reactive<Record<GameInfoSourceSiteNames, GameInfoSourceSite>>({
  "2DFan": {
    name: "2DFan",
    url: "https://2dfan.com/",
    searchStatus: SearchStatus.NOT_STARTED
  },
  "DLsite": {
    name: "DLsite",
    url: "https://www.dlsite.com/",
    searchStatus: SearchStatus.NOT_STARTED
  }
});

export const gamePreviewInfoList = reactive<Record<GameInfoSourceSiteNames, GamePreviewInfoItem[]>>({
  "2DFan": [],
  "DLsite": []
});

const gameInfoPreprocessData: Record<GameInfoSourceSiteNames, { gameInfo?: GameInfo, tags?: GameTags; }[]> = {
  "2DFan": [],
  "DLsite": []
};

export const currentGameInfo = reactive(structuredClone(defaultGameInfo));

export const currentGameTags = reactive<GameTags>({
  platform: new Set(),
  gameTypeTags: new Set(),
  categoryTags: new Set(),
  langTags: new Set(),
  storyTags: new Set()
});

export const telegramMessageIds = ref("");
export const configData = (() => {
  const result: ConfigData = JSON.parse(localStorage.getItem("configData") ?? `{ "botToken": "", "chatId": "", "API_Url":"" }`);
  if (result.API_Url) {
    result.API_Url = result.API_Url.replace(/\/$/, '');
    updateApiUrl(result.API_Url);
  }
  return result;
})();

export const resetData = () => {
  telegramMessageIds.value = "";
  Object.assign(currentGameInfo, structuredClone(defaultGameInfo));
  Object.assign(currentGameTags, structuredClone(defaultGameTags));
  siteNames.forEach(item => {
    gameInfoSourceSite[item].searchStatus = SearchStatus.NOT_STARTED;
    gamePreviewInfoList[item] = [];
    gameInfoPreprocessData[item] = [];
  });
};

export const getGamePreviewInfo = async (gameName: string, reqSite?: GameInfoSourceSiteNames) => {
  if (!gameName || !configData.API_Url) return;
  if (!reqSite) reqSite = "2DFan";

  gamePreviewInfoList[reqSite] = [];
  gameInfoSourceSite[reqSite].searchStatus = SearchStatus.SEARCHING;

  const data = await reqGameInfo(gameName, reqSite);
  if (!data?.[0]) {
    gamePreviewInfoList[reqSite] = [];
    gameInfoSourceSite[reqSite].searchStatus = SearchStatus.COMPLETED;
    return;
  };

  if (data[0].images[0].startsWith("/")) {
    data.forEach(item => {
      item.images = item.images.map(p => configData.API_Url + p);
    });
  }

  gamePreviewInfoList[reqSite] = data;
  gameInfoSourceSite[reqSite].searchStatus = SearchStatus.COMPLETED;
  gameInfoPreprocessData[reqSite] = preprocessGameInfoData(reqSite, data);
};

export const addCurrentGameImage = (img: string) => {
  if (currentGameInfo.images.length >= 10) return;
  if (currentGameInfo.images.findIndex(item => item.url === img) !== -1) return;
  currentGameInfo.images.push({ has_spoiler: false, url: img });
};

export const deleteCurrentGameImage = (img: string) => {
  const index = currentGameInfo.images.findIndex(item => item.url === img);
  if (index !== -1) currentGameInfo.images.splice(index, 1);
};

export const updateCurrentGameImageHasSpoiler = (img: { url: string, has_spoiler: boolean; }) => {
  img.has_spoiler = !img.has_spoiler;
};

export const replaceCurrentGameInfo = (siteName: GameInfoSourceSiteNames, index: number) => {
  const curPreprocessData = gameInfoPreprocessData[siteName][index];
  const gameInfo = structuredClone(curPreprocessData.gameInfo!);
  if (gameInfo.images.length >= 10) {
    gameInfo.images.splice(10);
  }
  Object.assign(currentGameInfo, structuredClone(curPreprocessData.gameInfo!));
  Object.assign(currentGameTags, structuredClone(curPreprocessData.tags!));
};

export const replaceCurrentGameInfoAt = <K extends keyof GameInfo>(siteName: GameInfoSourceSiteNames, key: K, index: number) => {
  const curPreprocessData = gameInfoPreprocessData[siteName][index];
  const field = key as keyof GameTags;

  currentGameInfo[key] = structuredClone(curPreprocessData.gameInfo![key]);
  if (currentGameTags[field]) {
    currentGameTags[field] = structuredClone(curPreprocessData.tags![field]);
  }
};

export const addCurrentGameInfoTagAt = (tagType: keyof GameTags, value: string) => {
  currentGameInfo[tagType].add(value);
  currentGameTags[tagType].delete(value);
};

export const deleteCurrentGameInfoTagAt = (tagType: keyof GameTags, value: string) => {
  currentGameInfo[tagType].delete(value);
  currentGameTags[tagType].add(value);
};

export const updateCurrentGameInfoAt = (key: keyof GameInfo, value: string) => {
  (currentGameInfo as any)[key] = value;
};

export const updateConfigDataAt = (key: keyof ConfigData, value: string) => {
  if (key === "API_Url") {
    value = value.replace(/\/$/, '');
    updateApiUrl(value);
  }
  configData[key] = value;
  localStorage.setItem("configData", JSON.stringify(configData));
};