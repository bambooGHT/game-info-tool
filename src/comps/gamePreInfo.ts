import { addCurrentGameImage, addCurrentGameInfoTagAt, gameInfoSourceSite, gamePreviewInfoList, getGamePreviewInfo, replaceCurrentGameInfo, replaceCurrentGameInfoAt, SearchText } from "@/data";
import { SearchStatus } from "@/enums";
import type { GameInfoSourceSite, GameInfoSourceSiteNames, GamePreviewInfoItem, GameTags } from "@/types";
import { h, ref, type Ref } from "vue";

const infoKeyName: Record<string, string> = {
  name: "游戏名",
  translateName: "译名",
  brand: "开发商",
  releaseDate: "发售日期",
  seriesName: "系列名",
  platform: "平台",
  langTags: "语言",
  gameTypeTags: "游戏标签",
  storyTags: "剧情",
  categoryTags: "内容",
  ageRestriction: "分级",
  introduction: "介绍"
};

export const gamePreInfoBox = () => {

  const gamePreInfolist = Object.values(gameInfoSourceSite).map(item => h(gamePreviewInfoItem(item)));

  return h("section", { class: "game-preview-info-box" }, h("section", { class: "game-preview-info" }, [
    ...gamePreInfolist
  ]));
};

const gamePreviewInfoItem = (site: GameInfoSourceSite) => {
  return {
    setup() {
      const currentInfoIndex = ref(0);

      return () => {
        const previewInfo = gamePreviewInfoList[site.name];
        const top = h("li", { class: "sticky" }, [
          h("div", site.name),
          h("ul", previewInfo.map((item, i) => {
            return h("li", {
              class: { button1: true, select: currentInfoIndex.value === i },
              onClick: () => currentInfoIndex.value = i
            }, `${i + 1}`);
          }))
        ]);
        const list = [top];
        const VNodes = status[site.searchStatus](site.name, previewInfo[currentInfoIndex.value], currentInfoIndex);
        Array.isArray(VNodes) ? list.push(...VNodes) : list.push(VNodes);

        return h("div", { class: "game-preview-info-item" }, h("ul", list));
      };
    }
  };
};

const searchEl = (siteName: GameInfoSourceSiteNames) => {
  return h("button", { class: "button1 load-button", onClick: () => getGamePreviewInfo(SearchText.value, siteName) }, siteName);
};

const infoEls = (siteName: GameInfoSourceSiteNames, previewInfo: GamePreviewInfoItem = {} as any, currentInfoIndex: Ref<number>) => {
  if (!Object.keys(previewInfo).length) {
    return [h("div", { class: "not_result", style: "font-weight: bold;" }, "not result")];
  }

  const images = h("li", { class: "preview-info-images" },
    h("ul", previewInfo.images.map(image => h("li", { key: image }, h("img", {
      src: image,
      onClick: () => addCurrentGameImage(image)
    })))
    )
  );

  const info = Object.entries(previewInfo).reduce((result, [key, value]) => {
    if (!infoKeyName[key] || value.length === 0) return result;

    const label = h("span", infoKeyName[key]);
    const content = typeof value === "string" ?
      h("span", { innerHTML: value }) :
      h("ul", { class: "preview-info-tags" }, value.map((item: string) => {
        return h("li", {
          innerHTML: `#${item}&nbsp;`, onClick: (e) => {
            e.stopPropagation();
            addCurrentGameInfoTagAt(key as keyof GameTags, item);
          }
        });
      }));


    result.push(h("li", {
      onDblclick: () => {
        replaceCurrentGameInfoAt(siteName, key as any, currentInfoIndex.value);
      },
      onMousedown: (e) => {
        if (e.detail > 1) {
          e.preventDefault();
        }
      }
    }, [label, content]));

    return result;
  }, [] as any[]);

  return [
    images,
    ...info,
    h("li", { class: "sticky" }, [
      h("button", { class: "button2", onClick: () => replaceCurrentGameInfo(siteName, currentInfoIndex.value) }, "修改"),
      h("a", { href: previewInfo.sourceUrl, target: "_blank" }, h("button", { class: "button1" }, "源网页"))
    ])
  ];
};

const searchingEl = () => {
  return h("div", { class: "loader" });
};

const status: Record<SearchStatus, (siteName: GameInfoSourceSiteNames, previewInfo: GamePreviewInfoItem, index: Ref<number>) => any> = {
  [SearchStatus.NOT_STARTED]: searchEl,
  [SearchStatus.SEARCHING]: searchingEl,
  [SearchStatus.COMPLETED]: infoEls
};