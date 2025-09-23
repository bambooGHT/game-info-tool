import axios from "axios";
import { JSDOM } from 'jsdom';
import type { GamePreviewInfo } from "../types";
import { DLsiteConstants } from "./constants";
import type { RouteContext } from "@/types";

let dl_cookie = "";

const headers: Record<string, string> = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh-TW,zh;q=0.9",
  "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
  "sec-ch-ua-platform": "\"Windows\"",
  "upgrade-insecure-requests": "1",
};

export const DLsite = async (text: string, routeContext: RouteContext): Promise<GamePreviewInfo[]> => {
  dl_cookie = routeContext["dlsite-cookie"];
  const urlList = await searchGame(text.replaceAll(" ", "+"));
  return urlList ? Promise.all(urlList.map(getGameInfo)) : [];
};

const reqDLsiteGameInfo = async (url: string) => {
  const res = await axios.get(url, {
    headers: {
      ...headers,
      ...(dl_cookie ? { Cookie: dl_cookie } : {})
    }
  });

  return res.data;
};

const searchResult = async (url: string, depth: number = 0): Promise<Element | null> => {
  const data = await reqDLsiteGameInfo(url);
  const document = new JSDOM(data).window.document;
  const listTable = document.querySelector(".work_1col_table.n_worklist");

  if (!listTable && depth < 1) {
    const listDOM = document.querySelectorAll(".extend_search_list_item");
    const otome = listDOM?.[1]?.querySelector("span");
    return otome ? await searchResult(listDOM[1].querySelector("a")!.href, ++depth) : null;
  }

  return listTable;
};

const searchGame = async (text: string): Promise<string[] | undefined> => {
  const listTable = await searchResult(generateDlsiteUrl(text));
  if (!listTable) return undefined;

  const domList = [...listTable.querySelector("tbody")!.children].slice(0, 4);
  const gameDOM = domList.find(p => p.querySelector<HTMLAnchorElement>(".work_name a")!.title.includes(text));
  if (gameDOM) return [gameDOM.querySelector("a")!.href];

  return domList.map(p => p.querySelector("a")!.href);
};

const getGameInfo = async (url: string): Promise<GamePreviewInfo> => {
  const data = await reqDLsiteGameInfo(url);
  const CN_Data = await reqDLsiteGameInfo(url + "?locale=zh_CN");
  const { document } = new JSDOM(data).window;
  const { document: CN_Document } = new JSDOM(CN_Data).window;

  let name = document.querySelector("#work_name")!.textContent;
  let translateName = CN_Document.querySelector("#work_name")!.textContent;
  const images = getImages([...document.querySelector(".product-slider-data")!.children]);
  const brand = CN_Document.querySelector("#work_maker a")!.textContent;

  const findInfo = findTableItem([...CN_Document.querySelector("#work_outline tbody")!.children]);
  const releaseDate = findInfo("发售日")!.textContent.replace(/年|月/g, "-").replace(/日/, "");
  const seriesName = findInfo("系列名")?.textContent.trim() || "";
  const platform = getAvailablePlatforms(CN_Document.querySelector(".os_popup_body tbody")!);
  const gameTypeTags = getGameTags(CN_Document.querySelector("#category_type")!);
  const categoryTags = [...findInfo("分类")!.querySelectorAll("a")!].map(p => p.textContent.trim());
  const storyTag = findInfo("其他")?.querySelector("span")?.textContent;
  const { name: n2, translateName: tn2, langTags } = await getLangTags(findInfo("支持的语言")!, CN_Document.querySelector(".work_edition_linklist.type_trans"));
  if (n2) name = n2;
  if (tn2) translateName = tn2;

  const ageRestriction = findInfo("年龄指定")?.textContent.trim() || undefined;
  const introduction = getIntroduction([...CN_Document.querySelectorAll(".work_parts_container .work_parts.type_text")]);

  return {
    name,
    translateName: translateName === name ? "" : translateName,
    images,
    brand,
    releaseDate,
    seriesName,
    platform,
    gameTypeTags,
    categoryTags,
    storyTags: storyTag ? [storyTag] : [],
    langTags,
    ageRestriction,
    sourceUrl: url,
    introduction: introduction
  };
};

const getImages = (els: Element[]) => {
  const result = els.map((p: Element) => {
    const srcset = p.getAttribute("data-src")!.replace(/_\d+x\d+(?=\.\w+$)/, "");
    return "https:" + srcset;
  });

  return result;
};

const findTableItem = (list: Element[]) => {
  return (key: string) => {
    const index = list.findIndex(p => p.textContent.includes(key));
    if (index === -1) return undefined;

    const result = list[index].querySelector("td");
    list.splice(index, 1);
    return result;
  };
};

const getAvailablePlatforms = (el: Element): string[] => {
  const platform = DLsiteConstants.platform;

  return [...el.children].reduce((result: string[], item, index) => {
    const [t1, t2] = item.querySelectorAll("td");
    if (t2.textContent !== "-") {
      result.push(platform[t1.textContent]);
    }
    return result;
  }, []);
};

const getGameTags = (el: Element): string[] => {
  const alist = ([...el.children] as HTMLAnchorElement[]).filter(p => p.href.includes("work_type"));
  return alist.map(p => p.querySelector("span")!.classList[0].split("_")[1]);
};

const getLangTags = async (el: Element, el2: Element | null): Promise<{ langTags: string[], name?: string, translateName?: string; }> => {
  const lang = DLsiteConstants.lang;
  const list = [...el.querySelector(".work_genre")!.children];
  const name = el2?.textContent || "";

  if (el2
    && (list.length === 1 || (list.every(p => p.textContent.includes("中文"))))
    && ["日文", "中文"].some(p => name.includes(p))) {
    const el2List = [...el2.children];
    const currentPage = el2.querySelector("a.current");
    const key = currentPage!.textContent.includes("日文") ? "name" : "translateName";
    const url = el2.querySelector<HTMLAnchorElement>("a:not(.current)")!.href;

    const data = await reqDLsiteGameInfo(url);
    const { document } = new JSDOM(data).window;

    return {
      [key]: document.querySelector("#work_name")!.textContent,
      langTags: el2List.map(p => lang[p.textContent.trim()] || "").filter(Boolean)
    };
  }

  return { langTags: list.map(p => lang[p.querySelector("span")!.title] || "").filter(Boolean) };
};

const getIntroduction = (list: Element[]): string => {
  const IncludeTextList = ["ストーリー", "剧情", "故事"];
  const item = list.find(p => {
    const title = p.querySelector(".work_parts_heading")?.textContent;
    if (!title) return false;

    return IncludeTextList.some(p => title.includes(p));
  });

  return item ? item.querySelector(".work_parts_area")!.textContent.trim() : "";
};

function generateDlsiteUrl(keyword: string) {
  const baseUrl = `${DLsiteConstants.baseUrl}/pro/fsr/=`;
  const language = "/language/jp";
  const sex = "/sex_category[0]/male";
  const keywordPart = `/keyword/${keyword}`;
  const workCategory = "/work_category[0]/doujin/work_category[1]/pc/work_category[2]/app/work_category[3]/ai";
  const order = "/order[0]/trend";
  const workType = "/work_type_category[0]/game/work_type_category_name[0]/游戏";
  const options = "/options_and_or/and/options[0]/JPN/options[1]/ENG/options[2]/CHI_HANS/options[3]/CHI_HANT/options[4]/KO_KR/options[5]/SPA/options[6]/ARA/options[7]/GER/options[8]/FRE/options[9]/IND/options[10]/ITA/options[11]/POR/options[12]/SWE/options[13]/THA/options[14]/VIE/options[15]/OTL/options[16]/NM/options_name[0]/日语作品/options_name[1]/英语作品/options_name[2]/简体中文作品/options_name[3]/繁体中文作品/options_name[4]/韩语作品/options_name[5]/无语言限制作品";
  const pagination = "/per_page/30/page/1/show_type/1/from/fs.detail/";
  const locale = "?locale=zh_CN";

  return baseUrl + language + sex + keywordPart + workCategory + order + workType + options + pagination + locale;
}