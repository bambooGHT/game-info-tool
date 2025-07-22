import { SearchStatus } from "@/enums";
import { GAME_INFO_API, reqGameInfo } from "@/service/api";
import type { GameInfo, GameInfoSourceSite, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags, TelegramData } from "@/types";
import { reactive, ref, toRaw } from "vue";
import { imageCorsBlockedSources, defaultGameTags, defaultGameInfo, siteNames } from "./defaultData";
import { excludeTags, filterTags } from "./tools";

export const SearchText = ref("");
export const gameInfoSourceSite = reactive<Record<GameInfoSourceSiteNames, GameInfoSourceSite>>({
  "2DFan": {
    name: "2DFan",
    url: "https://2dfan.com/",
    searchStatus: SearchStatus.NOT_STARTED
  }
});

export const gamePreviewInfoList = reactive<Record<GameInfoSourceSiteNames, GamePreviewInfoItem>>({
  "2DFan": {} as GamePreviewInfoItem
});

const gameInfoPreprocessData: Record<GameInfoSourceSiteNames, { gameInfo?: GameInfo, tags?: GameTags; }> = {
  "2DFan": {}
};

export const currentGameInfo = reactive(structuredClone(defaultGameInfo));

export const currentGameTags = reactive<GameTags>({
  platform: new Set(),
  gameTags: new Set(),
  pornTags: new Set(),
  langTags: new Set(),
  storyTags: new Set()
});

export const telegramMessageIds = ref("");
export const telegramData = (() => {
  const result: TelegramData = JSON.parse(localStorage.getItem("telegramData") ?? `{ "botToken": "", "chatId": "" }`);
  return result;
})();

export const resetData = () => {
  telegramMessageIds.value = "";
  Object.assign(currentGameInfo, structuredClone(defaultGameInfo));
  Object.assign(currentGameTags, structuredClone(defaultGameTags));
  siteNames.forEach(item => {
    gameInfoSourceSite[item].searchStatus = SearchStatus.NOT_STARTED;
    gamePreviewInfoList[item] = {} as any;
    gameInfoPreprocessData[item] = {};
  });
};

export const getGamePreviewInfo = async (gameName: string, reqSite?: GameInfoSourceSiteNames) => {
  if (!gameName) return;
  if (!reqSite) reqSite = "2DFan";

  gamePreviewInfoList[reqSite] = {} as any;
  gameInfoSourceSite[reqSite].searchStatus = SearchStatus.SEARCHING;

  const data = await reqGameInfo(gameName, reqSite);
  if (!data) {
    gamePreviewInfoList[reqSite] = {} as any;
    gameInfoSourceSite[reqSite].searchStatus = SearchStatus.COMPLETED;
    return;
  };

  if (imageCorsBlockedSources.includes(reqSite)) {
    // 需要修改
    data.images = [(data as any).image].map(image => `${GAME_INFO_API}/image?url=${image}`);
  }

  gamePreviewInfoList[reqSite] = data;
  gameInfoSourceSite[reqSite].searchStatus = SearchStatus.COMPLETED;
  gameInfoPreprocessData[reqSite] = preprocessGameInfoData(data);
};

const preprocessGameInfoData = (info: GamePreviewInfoItem) => {
  const { platform, gameTags, pornTags, langTags = [], images, ...rest } = info;
  const { langTags: rawLang,
    storyTags: rawStory,
    gameTags: rawGame,
    pornTags: rawPorn,
    platform: rawPlatform } = defaultGameTags;

  const tags = excludeTags(gameTags, [...rawGame, ...rawStory, ...rawLang]);
  const langSet = langTags.length ? new Set(langTags) : filterTags(rawLang, gameTags);

  tags.forEach(item => {
    if (item.includes("翻译")) {
      if (langSet.size === 0) langSet.add("精翻");
      tags.delete(item);
    }
  });

  const pornTagList = [...tags, ...pornTags];
  const storySet = filterTags(rawStory, [...pornTags, ...gameTags]);
  const gameSet = filterTags(rawGame, gameTags);
  const imgs = images.map(p => ({ has_spoiler: false, url: p }));

  return {
    gameInfo: {
      ...rest,
      images: imgs,
      platform: new Set(platform),
      gameTags: gameSet,
      pornTags: new Set(pornTagList),
      langTags: langSet,
      storyTags: storySet
    },
    tags: {
      platform: excludeTags(rawPlatform, platform),
      gameTags: excludeTags(rawGame, [...gameSet]),
      pornTags: excludeTags(rawPorn, pornTagList),
      langTags: excludeTags(rawLang, [...langSet]),
      storyTags: excludeTags(rawStory, [...storySet]),
    }
  };
};

export const addCurrentGameImage = (img: string) => {
  if (currentGameInfo.images.findIndex(item => item.url === img) !== -1) return;
  currentGameInfo.images.push({ has_spoiler: false, url: img });
};

export const deleteCurrentGameImage = (img: string) => {
  if (currentGameInfo.images.length === 1) return;

  const index = currentGameInfo.images.findIndex(item => item.url === img);
  if (index !== -1) currentGameInfo.images.splice(index, 1);
};

export const updateCurrentGameImageHasSpoiler = (img: { url: string, has_spoiler: boolean; }) => {
  img.has_spoiler = !img.has_spoiler;
};

export const replaceCurrentGameInfo = (siteName: GameInfoSourceSiteNames) => {
  const curPreprocessData = gameInfoPreprocessData[siteName];
  Object.assign(currentGameInfo, structuredClone(curPreprocessData.gameInfo!));
  Object.assign(currentGameTags, structuredClone(curPreprocessData.tags!));
};

export const replaceCurrentGameInfoAt = <K extends keyof GameInfo>(siteName: GameInfoSourceSiteNames, key: K) => {
  const curPreprocessData = gameInfoPreprocessData[siteName];
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

export const updateTelegramDataAt = (key: keyof TelegramData, value: string) => {
  telegramData[key] = value;
  localStorage.setItem("telegramData", JSON.stringify(telegramData));
};