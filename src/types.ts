import type { SearchStatus } from "./enums";

export type GameInfoSourceSiteNames = "2DFan";

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
  /** 发售平台 */
  platform: string[];
  /** 游戏标签 */
  gameTags: string[];
  /** 色情标签 */
  pornTags: string[];
  /** 语言标签 */
  langTags: string[];
  /** 来源Url */
  sourceUrl: string;
  /** 介绍 */
  introduction: string;
}

export interface GameInfo extends Omit<GamePreviewInfoItem, "sourceUrl" | "platform" | "gameTags" | "pornTags" | "langTags"> {
  platform: Set<string>;
  gameTags: Set<string>;
  pornTags: Set<string>;
  langTags: Set<string>;
  storyTags: Set<string>;
  /** 下载Url */
  downloadUrl?: string;
  orthrText?: string;
}

export interface GameTags extends Pick<GameInfo, "platform" | "gameTags" | "pornTags" | "langTags" | "storyTags"> { }

export interface TelegramData {
  botToken: string;
  chatId: string;
}

export interface SendRecord {
  name: string;
  translateName: string;
  ids: number[];
  sendTime: string;
}