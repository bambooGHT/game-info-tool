import { _2DfanConstants } from "./constants";
import { JSDOM } from 'jsdom';
import type { GamePreviewInfo } from "../types";
import axios from "axios";

export const _2DFan = async (text: string): Promise<GamePreviewInfo[]> => {
  const urlList = await searchGame(text);

  return urlList ? Promise.all(urlList.map(getGameInfo)) : [];
};

const req2DFanGameInfo = async (url: string) => {
  const res = await axios.get(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
    }
  });

  return res.data;
};

const searchGame = async (text: string): Promise<string[] | undefined> => {
  const searchUrl = `${_2DfanConstants.baseUrl}/subjects/search?keyword=${text}`;
  const data = await req2DFanGameInfo(searchUrl);

  const { document } = new JSDOM(data).window;
  if (document.querySelector(".intro-list .muted")) {
    return undefined;
  }

  const domList = [...document.querySelector(".intro-list")!.querySelectorAll("li")].slice(0, 4);
  const gameDOM = domList.find(item => item.querySelector(".media-heading")!.textContent === text);
  if (gameDOM) return [spliceUrl(gameDOM.querySelector<HTMLAnchorElement>("a")!.href)];

  return domList.map(p => spliceUrl(p.querySelector<HTMLAnchorElement>("a")!.href));
};

const getGameInfo = async (url: string): Promise<GamePreviewInfo> => {
  const data = await req2DFanGameInfo(url);
  const { document } = new JSDOM(data).window;

  const tagGroup = document.querySelector(".media-body.control-group .control-group")!.querySelectorAll(".tags")!;
  const translateName = getTranslateName(tagGroup[tagGroup.length - 1]);
  const brand = tagGroup[0].querySelector("a")!.textContent;
  const images = [document.querySelector<HTMLImageElement>(".subject-package")!.src].map(p => {
    return "/imgProxy?url=" + p.replace("normal_", "");
  });
  const releaseDate = tagGroup[1].textContent.match(/\d{4}-\d{2}-\d{2}/)![0];
  const categoryTags = [...document.querySelector(".collapse.in.tags")!.children].map(p => p.textContent!.trim());

  return {
    name: document.querySelector(".no-border")!.querySelector("h3")!.textContent,
    translateName,
    images,
    brand,
    releaseDate,
    seriesName: "",
    platform: [],
    gameTags: [],
    categoryTags,
    langTags: [],
    storyTags: [],
    sourceUrl: url,
    introduction: document.querySelector("blockquote")?.textContent?.trim() || ""
  };
};

const getTranslateName = (dom: Element) => {
  return dom.textContent.includes("又名") ? dom.querySelector(".muted")!.textContent : "";
};

const spliceUrl = (url: string) => {
  return _2DfanConstants.baseUrl + url;
};