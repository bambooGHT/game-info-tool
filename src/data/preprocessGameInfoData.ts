import type { GameInfo, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags } from "@/types";
import { defaultGameTags } from "./defaultData";
import { excludeTags, filterTags } from "./tools";

type PreprocessSite = (preInfo: GamePreviewInfoItem[]) => { gameInfo?: GameInfo, tags?: GameTags; }[];

const { langTags: rawLang,
  storyTags: rawStory,
  gameTypeTags: rawGameType,
  categoryTags: rawCategory,
  platform: rawPlatform } = defaultGameTags;

export const preprocessGameInfoData = (siteName: GameInfoSourceSiteNames, preInfo: GamePreviewInfoItem[]): ReturnType<PreprocessSite> => {
  return preprocessSites[siteName](preInfo);
};


const _2dfanPreprocessData: PreprocessSite = (preInfos) => {
  return preInfos.map(preInfo => {
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
    rawStory.forEach(p => storySet.add(p));

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
      }
    };
  });
};

const dlsitePreprocessData: PreprocessSite = (preInfos) => {
  return preInfos.map(preInfo => {
    const { platform, gameTags, categoryTags, langTags = [], storyTags, images, ageRestriction, ...rest } = preInfo;

    const platformSet = new Set(platform);
    const gameTypeSet = new Set(gameTags);
    const categorySet = excludeTags(categoryTags, rawStory);

    const langSet = new Set(langTags);
    const storySet = filterTags(rawStory, ageRestriction ? [...categoryTags, ageRestriction] : categoryTags);
    rawStory.forEach(p => storySet.add(p));

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
      }
    };
  });
};

const preprocessSites: Record<GameInfoSourceSiteNames, PreprocessSite> = {
  "2DFan": _2dfanPreprocessData,
  "DLsite": dlsitePreprocessData
};