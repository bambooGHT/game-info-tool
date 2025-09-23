import { SearchStatus } from "@/enums";
import { reqGameInfo, updateApiConfig } from "@/services/api";
import type { GameInfo, GameInfoSourceSite, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags, ConfigData } from "@/types";
import { reactive, ref } from "vue";
import { defaultGameTags, defaultGameInfo, siteNames, addDefaultGameTag, removeDefaultGameTag } from "./defaultData";
import { preprocessGameInfoData, type PreprocessSite } from "./preprocessGameInfoData";

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

const gameInfoPreprocessData: Record<GameInfoSourceSiteNames, ReturnType<PreprocessSite>> = {
  "2DFan": {},
  "DLsite": {}
};

export const currentGameInfo = reactive(structuredClone(defaultGameInfo));

export const currentGameTags = reactive({} as GameTags);

export const telegramMessageIds = ref("");
export const configData = (() => {
  const result: ConfigData = JSON.parse(localStorage.getItem("configData") ?? `{ "botToken": "", "chatId": "", "API_Url":"" }`);
  if (result.API_Url || result.dlsiteCookie) {
    result.API_Url = result.API_Url.replace(/\/$/, '');
    updateApiConfig({ baseURL: result.API_Url, dlsiteCookie: result.dlsiteCookie });
  }
  return result;
})();

const resetCurrentGameTags = () => {
  Object.assign(currentGameTags, {
    platform: new Set(defaultGameTags.platform),
    gameTypeTags: new Set(defaultGameTags.gameTypeTags),
    categoryTags: new Set(defaultGameTags.categoryTags),
    langTags: new Set(defaultGameTags.langTags),
    storyTags: new Set(defaultGameTags.storyTags)
  });
};

export const resetData = () => {
  telegramMessageIds.value = "";
  Object.assign(currentGameInfo, structuredClone(defaultGameInfo));
  resetCurrentGameTags();
  siteNames.forEach(item => {
    gameInfoSourceSite[item].searchStatus = SearchStatus.NOT_STARTED;
    gamePreviewInfoList[item] = [];
    gameInfoPreprocessData[item] = {};
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

  gameInfoSourceSite[reqSite].searchStatus = SearchStatus.COMPLETED;
  gameInfoPreprocessData[reqSite] = preprocessGameInfoData(reqSite, data);

  const newData = structuredClone(data);
  gameInfoPreprocessData[reqSite].list!.forEach(({ gameInfo }, index) => {
    const newDataItem = newData[index];
    newDataItem.platform = [...gameInfo.platform];
    newDataItem.gameTypeTags = [...gameInfo.gameTypeTags];
    newDataItem.categoryTags = [...gameInfo.categoryTags];
    newDataItem.langTags = [...gameInfo.langTags];
    newDataItem.storyTags = [...gameInfo.storyTags];
    newDataItem.releaseDate = gameInfo.releaseDate;
  });
  gamePreviewInfoList[reqSite] = newData;
};

const resetPreprocessGameInfoData = () => {
  Object.entries(gameInfoPreprocessData).forEach(([siteName, data]) => {
    if (!data.raw) return;
    gameInfoPreprocessData[siteName as GameInfoSourceSiteNames] = preprocessGameInfoData(siteName as any, data.raw!);
  });
};

export const addCurrentGameImage = (img: string, file?: File) => {
  if (currentGameInfo.images.length >= 10) return;
  if (currentGameInfo.images.findIndex(item => item.url === img) !== -1) return;
  currentGameInfo.images.push({ has_spoiler: false, file, url: img });
};

export const uploadGameImage = async () => {
  const [fileHandle] = await window.showOpenFilePicker({
    multiple: false,
    types: [{
      description: 'Images',
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff']
      },
    }]
  });

  const file = await fileHandle.getFile();
  const url = URL.createObjectURL(file);
  addCurrentGameImage(url, file);
};

export const deleteCurrentGameImage = (img: string) => {
  const index = currentGameInfo.images.findIndex(item => item.url === img);
  if (index !== -1) currentGameInfo.images.splice(index, 1);
};

export const updateCurrentGameImageHasSpoiler = (img: { url: string, has_spoiler: boolean; }) => {
  img.has_spoiler = !img.has_spoiler;
};

export const replaceCurrentGameInfo = (siteName: GameInfoSourceSiteNames, index: number) => {
  const curPreprocessData = gameInfoPreprocessData[siteName].list![index];
  const gameInfo = structuredClone(curPreprocessData.gameInfo);
  if (gameInfo.images.length >= 10) {
    gameInfo.images.splice(10);
  }
  Object.assign(currentGameInfo, structuredClone(gameInfo));
  Object.assign(currentGameTags, structuredClone(curPreprocessData.tags));
};

export const replaceCurrentGameInfoAt = <K extends keyof GameInfo>(siteName: GameInfoSourceSiteNames, key: K, index: number) => {
  const curPreprocessData = gameInfoPreprocessData[siteName].list![index];
  const field = key as keyof GameTags;

  currentGameInfo[key] = structuredClone(curPreprocessData.gameInfo[key]);
  currentGameTags[field] &&= structuredClone(curPreprocessData.tags[field]);
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
  if (key === "API_Url" || key === "dlsiteCookie") {
    value = value.replace(/\/$/, '');
    updateApiConfig({ ["dlsiteCookie"]: value });
  }
  configData[key] = value;
  localStorage.setItem("configData", JSON.stringify(configData));
};

export const addDefaultGameTagAt = (type: keyof GameTags, value: string) => {
  if (addDefaultGameTag(type, value)) resetPreprocessGameInfoData();


  if (currentGameTags[type].has(value) || currentGameInfo[type].has(value)) return;
  currentGameTags[type].add(value);
};

export const removeDefaultGameTagAt = (type: keyof GameTags, value: string) => {
  if (removeDefaultGameTag(type, value)) resetPreprocessGameInfoData();


  if (currentGameTags[type].has(value)) currentGameTags[type].delete(value);
};

resetCurrentGameTags();