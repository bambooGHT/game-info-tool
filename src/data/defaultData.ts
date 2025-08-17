import type { GameInfo, GameInfoSourceSiteNames } from "@/types";

export const siteNames: GameInfoSourceSiteNames[] = ["2DFan", "DLsite"];

export const defaultGameTags = {
  /** 平台标签 */
  platform: ["Windows", "安卓"],
  /** 游戏标签 */
  gameTypeTags: ['ACT', 'RPG', 'SLG', 'AVG', 'GALGAME', 'ADV', '3D', 'ACN', 'SLN', 'STG', 'PZL', 'QIZ', 'DNV'],
  /** 类别标签 */
  categoryTags: [],
  /** 语言标签 */
  langTags: ['日文', '生肉', '英文', '汉化', '简中', '繁中', 'AI翻译', '精翻'],
  /** 剧情标签 */
  storyTags: ['全年龄', "R18", '拔作', '正常向', '乙女向', '猎奇', '恐怖', '血腥', '纯爱']
};

export const defaultGameInfo: GameInfo = {
  "name": "",
  "translateName": "",
  "images": [],
  "brand": "",
  "releaseDate": "",
  seriesName: "",
  platform: new Set(),
  gameTypeTags: new Set(),
  categoryTags: new Set(),
  langTags: new Set(),
  storyTags: new Set(),
  orthrText: "",
  introduction: "",
  downloadUrl: ""
};