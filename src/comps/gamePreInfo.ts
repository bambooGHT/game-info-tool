import { addCurrentGameImage, gameInfoSourceSite, gamePreviewInfoList, getGamePreviewInfo, replaceCurrentGameInfo, replaceCurrentGameInfoAt, SearchText } from "@/data";
import { SearchStatus } from "@/enums";
import type { GameInfoSourceSiteNames, GamePreviewInfoItem } from "@/types";
import { h } from "vue";

const infoKeyName: Record<string, string> = {
  name: "游戏名",
  translateName: "译名",
  brand: "开发商",
  releaseDate: "发售日期",
  platform: "平台",
  gameTags: "游戏标签",
  pornTags: "R18标签",
  introduction: "介绍"
};

export const gamePreInfoBox = () => {
  const status: Record<SearchStatus, (siteName: GameInfoSourceSiteNames, previewInfo: GamePreviewInfoItem) => any> = {
    [SearchStatus.NOT_STARTED]: searchEl,
    [SearchStatus.SEARCHING]: searchingEl,
    [SearchStatus.COMPLETED]: infoEls
  };

  const GamePreInfolist = Object.values(gameInfoSourceSite).map(item => {
    const previewInfo = gamePreviewInfoList[item.name];
    const list = [h("li", { class: "sticky" }, item.name)];
    const VNodes = status[item.searchStatus](item.name, previewInfo);
    Array.isArray(VNodes) ? list.push(...VNodes) : list.push(VNodes);

    return h("div", { class: "game-preview-info-item" }, h("ul", list));
  });

  return h("section", { class: "game-preview-info-box" }, h("section", { class: "game-preview-info" }, [
    ...GamePreInfolist
  ]));
};

const searchEl = (siteName: GameInfoSourceSiteNames) => {
  return h("button", { class: "button1 load-button", onClick: () => getGamePreviewInfo(SearchText.value, siteName) }, siteName);
};

const infoEls = (siteName: GameInfoSourceSiteNames, previewInfo: GamePreviewInfoItem) => {
  if (!Object.keys(previewInfo).length) {
    return [h("div", { style: "font-weight: bold;" }, "not result")];
  }

  const images = h("li", { class: "preview-info-images" },
    h("ul", previewInfo.images.map(image => h("li", h("img", {
      src: image,
      onClick: () => addCurrentGameImage(image)
    }))))
  );

  const info = Object.entries(previewInfo).reduce((result, [key, value]) => {
    if (!infoKeyName[key] || value.length === 0) return result;

    const label = h("span", infoKeyName[key]);
    const content = h("span", {
      innerHTML: typeof value === "string" ? value :
        value.map((item: string) => `#${item}&nbsp;`).join("")
    });

    result.push(h("li", { onDblclick: () => replaceCurrentGameInfoAt(siteName, key as any) }, [label, content]));

    return result;
  }, [] as any[]);

  return [
    images,
    ...info,
    h("li", { class: "sticky" }, [
      h("button", { class: "button2", onClick: () => replaceCurrentGameInfo(siteName) }, "修改"),
      h("a", { href: previewInfo.sourceUrl, target: "_blank" }, h("button", { class: "button1" }, "源网页"))
    ])
  ];
};

const searchingEl = () => {
  return h("div", { class: "loader" });
};