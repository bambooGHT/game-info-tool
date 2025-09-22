export interface GamePreviewInfo {
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
  /** 类别标签 */
  storyTags: string[];
  /** 语言标签 */
  langTags: string[];
  /** 年龄限制 */
  ageRestriction?: string;
  /** 来源Url */
  sourceUrl: string;
  /** 介绍 */
  introduction: string;
}
