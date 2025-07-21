import type { GameInfo, GameInfoSourceSiteNames } from "@/types";

export const siteNames: GameInfoSourceSiteNames[] = ["2DFan"];
export const imageCorsBlockedSources: GameInfoSourceSiteNames[] = ["2DFan"];

export const defaultGameTags = {
  /** 平台标签 */
  platform: ["Windows", "安卓"],
  /** 游戏标签 */
  gameTags: ['ACT', 'RPG', 'SLG', 'AVG', 'GALGAME', 'ADV', '3D'],
  /** R18标签 */
  pornTags: [],
  /** 语言标签 */
  langTags: ['日文', '生肉', '英文', '汉化', '简中', '繁中', 'AI翻译', '精翻'],
  /** 剧情标签 */
  storyTags: ['全年龄', "R18", '拔作', '正常向', '猎奇', '恐怖', '血腥', '纯爱']
};

export const defaultGameInfo: GameInfo = {
  "name": "",
  "translateName": "",
  "images": [],
  "brand": "",
  "releaseDate": "",
  platform: new Set(),
  gameTags: new Set(),
  pornTags: new Set(),
  langTags: new Set(),
  storyTags: new Set(),
  orthrText: "",
  introduction: "",
  downloadUrl: ""
};