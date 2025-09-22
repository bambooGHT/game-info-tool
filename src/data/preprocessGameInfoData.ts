import type { GameInfo, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags } from "@/types";
import { defaultGameTags } from "./defaultData";
import { excludeTags, filterTags } from "./tools";

export type PreprocessSite = (preInfos: GamePreviewInfoItem[]) => {
  list?: { gameInfo: GameInfo, tags: GameTags; }[];
  raw?: GamePreviewInfoItem[];
};

export const preprocessGameInfoData = (siteName: GameInfoSourceSiteNames, preInfos: GamePreviewInfoItem[]): ReturnType<PreprocessSite> => {
  return preprocessSites[siteName](preInfos);
};


const _2dfanPreprocessData: PreprocessSite = (preInfos) => {
  const { langTags: rawLang,
    storyTags: rawStory,
    gameTypeTags: rawGameType,
    categoryTags: rawCategory,
    platform: rawPlatform } = defaultGameTags;

  const result = preInfos.map(preInfo => {
    const { platform, gameTags, categoryTags, langTags = [], storyTags, images, ageRestriction, ...rest } = preInfo;
    const excludedCategoryTags = [...rawGameType, ...rawStory, ...rawLang];
    const storyFilterTags = [...categoryTags, ...gameTags];

    if (ageRestriction) {
      excludedCategoryTags.push(ageRestriction);
      storyFilterTags.push(ageRestriction);
    }

    const platformSet = new Set(platform);
    const gameTypeSet = filterTags([...rawGameType, ...gameTags], categoryTags);
    const langSet = filterTags(rawLang, categoryTags);
    const categorySet = excludeTags(categoryTags, excludedCategoryTags);
    categorySet.forEach(item => {
      if (["翻译", "汉化", "机翻"].some(tag => item.includes(tag))) {
        if (langSet.size === 0) langSet.add("精翻");
        categorySet.delete(item);
      }
    });

    const storySet = filterTags(rawStory, storyFilterTags);
    storyTags.forEach(p => storySet.add(p));

    const imgs = images.map(p => ({ has_spoiler: false, url: p }));

    return {
      gameInfo: {
        ...rest,
        images: imgs,
        platform: platformSet,
        gameTypeTags: gameTypeSet,
        categoryTags: categorySet,
        langTags: langSet,
        storyTags: storySet
      },
      tags: {
        platform: excludeTags(rawPlatform, platform),
        gameTypeTags: excludeTags(rawGameType, [...gameTypeSet]),
        categoryTags: excludeTags(rawCategory, [...categorySet]),
        langTags: excludeTags(rawLang, [...langSet]),
        storyTags: excludeTags(rawStory, [...storySet]),
      },
    };
  });

  return { list: result, raw: preInfos };
};

const dlsitePreprocessData: PreprocessSite = (preInfos) => {
  const { langTags: rawLang,
    storyTags: rawStory,
    gameTypeTags: rawGameType,
    categoryTags: rawCategory,
    platform: rawPlatform } = defaultGameTags;

  const result = preInfos.map(preInfo => {
    const { platform, gameTags, categoryTags, langTags = [], storyTags, images, ageRestriction, ...rest } = preInfo;

    const platformSet = new Set(platform);
    const gameTypeSet = new Set(gameTags);
    const categorySet = excludeTags(categoryTags, rawStory);

    const langSet = new Set(langTags);
    const storySet = filterTags(rawStory, ageRestriction ? [...categoryTags, ageRestriction] : categoryTags);
    storyTags.forEach(p => storySet.add(p));

    const imgs = images.map(p => ({ has_spoiler: false, url: p }));

    return {
      gameInfo: {
        ...rest,
        images: imgs,
        platform: platformSet,
        gameTypeTags: gameTypeSet,
        categoryTags: categorySet,
        langTags: langSet,
        storyTags: storySet
      },
      tags: {
        platform: excludeTags(rawPlatform, platform),
        gameTypeTags: excludeTags(rawGameType, gameTags),
        categoryTags: excludeTags(rawCategory, [...categorySet]),
        langTags: excludeTags(rawLang, langTags),
        storyTags: excludeTags(rawStory, [...storySet]),
      },
    };
  });
  return { list: result, raw: preInfos };
};

const preprocessSites: Record<GameInfoSourceSiteNames, PreprocessSite> = {
  "2DFan": _2dfanPreprocessData,
  "DLsite": dlsitePreprocessData
};