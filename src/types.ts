import type { SearchStatus } from "./enums";

export type GameInfoSourceSiteNames = "2DFan" | "DLsite";

export interface GameInfoSourceSite {
  /** 网站名 */
  name: GameInfoSourceSiteNames,
  /** 网站Url */
  url: string;
  searchStatus: SearchStatus;
}

export interface GamePreviewInfoItem {
  /** 游戏名 */
  name: string,
  /** 翻译名 */
  translateName: string,
  /** 封面 */
  images: string[],
  /** 品牌 */
  brand: string;
  /** 发售日期 */
  releaseDate: string;
  /** 系列名 */
  seriesName: string;
  /** 发售平台 */
  platform: string[];
  /** 游戏标签 */
  gameTypeTags: string[];
  /** 类别标签 */
  categoryTags: string[];
  /** 语言标签 */
  langTags: string[];
  /** 类别标签 */
  storyTags: string[];
  /** 年龄限制 */
  ageRestriction?: string;
  /** 来源Url */
  sourceUrl: string;
  /** 介绍 */
  introduction: string;
}

export interface GameInfo extends Omit<GamePreviewInfoItem, "images" | "sourceUrl" | "platform" | "gameTypeTags" | "categoryTags" | "langTags" | "storyTags" | "ageRestriction"> {
  platform: Set<string>;
  gameTypeTags: Set<string>;
  categoryTags: Set<string>;
  langTags: Set<string>;
  storyTags: Set<string>;
  /** 下载Url */
  downloadUrl?: string;
  orthrText?: string;
  images: { has_spoiler: boolean, url: string; }[];
}

export interface GameTagsArray extends Pick<GamePreviewInfoItem, "platform" | "categoryTags" | "langTags" | "storyTags"> {
  gameTypeTags: string[];
}
export interface GameTags extends Pick<GameInfo, "platform" | "gameTypeTags" | "categoryTags" | "langTags" | "storyTags"> { }

export interface ConfigData {
  botToken: string;
  chatId: string;
  API_Url: string;
}

export interface SendRecord {
  name: string;
  translateName: string;
  ids: number[];
  sendTime: string;
}