import { deleteTgMessage, editMessage, sendTgMessage } from "@/services/telegramAPI";
import type { GameInfo, ConfigData, GameTags } from "@/types";
import { deleteMessageRecord, addMessageRecord, updateMessageRecord } from "./messageRecord";

export const sendMessage = (configData: ConfigData, gameInfo: GameInfo, gametags: GameTags) => {
  if (!Object.keys(gameInfo).length || (!gameInfo.images.length && !gameInfo.ids)) return;

  const { ids, translateName, name,
    releaseDate, images,
    platform, brand,
    gameTypeTags, categoryTags,
    langTags, storyTags, seriesName,
    orthrText = "", introduction
  } = gameInfo;


  const rows = [
    translateName && "🎮" + translateName,
    translateName ? name : "🎮" + name,
    `\n🏭开发商 #${brand}`,
    formatTags("🖥运行平台 ", platform),
    formatTags("🌐语言 ", langTags),
    formatTags("📓剧情分类 ", storyTags),
    formatTags("🌟游戏类型 ", gameTypeTags),
    formatTags("🏷︎内容分类 ", categoryTags),
    `🗓发售日期 #${releaseDate}`,
    seriesName ? `系列名 #${seriesName}` : "",
    orthrText.trim() ? `\n${orthrText}` : "",
  ].filter(Boolean).join("\n");;

  let downloadUrlText = gameInfo.downloadUrl?.trim() || "";
  if (downloadUrlText) {
    if (downloadUrlText.startsWith("http")) {
      downloadUrlText = `\n\n[下载地址](${downloadUrlText})`;
    } else {
      downloadUrlText = "\n\n" + downloadUrlText.split("\n").map(text => {
        const [title, url] = text.trim().split(" ");
        if (url?.startsWith("http")) {
          return `[${title}](${url})`;
        }
      }).filter(Boolean).join("\n");
    }
  }
  const t1 = escapeMarkdownV2(rows);
  const t3 = escapeMarkdownV2(downloadUrlText, ['(', ')']);
  const { introHead, introFolded } = splitIntroduction(introduction, 970 - t1.length - t3.length);
  const resultText = t1 + introHead + introFolded + t3;
  console.log(resultText);

  if (ids) {
    editMessage(configData, { images, message: resultText }, ids).then(() => {
      updateMessageRecord(structuredClone(gameInfo), structuredClone(gametags));
    });;
    return;
  }

  sendTgMessage(configData, { images, message: resultText }).then((res) => {
    addMessageRecord(structuredClone(gameInfo), structuredClone(gametags), Array.isArray(res) ? res : [res]);
  });
};

export const deleteMessage = async (configData: ConfigData, ids: number[]) => {
  await deleteTgMessage(configData, ids);
  deleteMessageRecord(ids);
};

const splitIntroduction = (introduction: string, maxLength: number) => {
  if (!introduction) {
    return { introHead: [], introFolded: "" };
  }
  if (introduction.length > maxLength) introduction = introduction.slice(0, maxLength) + "...";

  const introLines = introduction.split("\n").map(p => p.trim());
  let introHead: string[] = [];
  if (introLines.join("").length < 200) {
    introHead = introLines.splice(0);
  } else {
    let size = 0;
    let textIndex = 0;
    while (textIndex < 4 && textIndex < introLines.length && size < 200) {
      size += introLines[textIndex++].length;
    }
    if (textIndex < introLines.length) introHead = introLines.splice(0, textIndex);
  }

  introHead.length && introHead.unshift("\n\n📜 —————游戏介绍——————\n");
  const introFolded = introLines.length ? "\n" + foldText(escapeMarkdownV2(introLines.join("\n"))) : "";

  return { introHead: escapeMarkdownV2(introHead.join("\n")), introFolded, rawText: introLines.join("\n") };
};

const formatTags = (title: string, set: Set<string>) =>
  set.size ? `${title}${[...set].map(tag => `#${tag}`).join(" ")}` : "";

function escapeMarkdownV2(text: string, excludeReservedChars: string[] = []) {
  if (!text.length) return text;

  let reservedChars = ['_', '*', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!', '(', ')'];
  if (excludeReservedChars.length) {
    reservedChars = reservedChars.filter(P => !excludeReservedChars.includes(P));
  }
  const escapedChars = reservedChars.map(char => '\\' + char).join('');
  const regex = new RegExp(`([${escapedChars}])`, 'g');
  return text.replace(regex, '\\$1');
}

function foldText(text: string) {
  return '**>' + text.split("\n").map(line => '> ' + line.trim()).join("\n") + "||";
};