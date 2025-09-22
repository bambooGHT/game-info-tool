import { sendTgMessage } from "@/services/telegramAPI";
import type { GameInfo, SendRecord, ConfigData } from "@/types";

export const sendRecord = (() => {
  const result: SendRecord[] = JSON.parse(localStorage.getItem("sendRecord") ?? "[]");
  return result;
})();

export const saveSendRecord = (data: SendRecord) => {
  sendRecord.unshift(data);
  if (sendRecord.length > 300) sendRecord.pop();
  localStorage.setItem("sendRecord", JSON.stringify(sendRecord));
};

export const sendMessage = (configData: ConfigData, gameInfo: GameInfo, messageIdStr: string) => {
  if (!Object.keys(gameInfo).length || !gameInfo.images.length) return;

  const messageIds = messageIdStr ? messageIdStr.split(" ").map(p => p.trim()).filter(Boolean) : undefined;

  const { translateName, name,
    releaseDate,
    platform, brand,
    gameTypeTags: gameTags, categoryTags,
    langTags, storyTags, seriesName,
    orthrText = "", introduction
  } = gameInfo;

  const images = gameInfo.images[0].url.includes("url=") ? gameInfo.images.map(p => {
    return {
      has_spoiler: p.has_spoiler,
      url: p.url.split("url=")[1]
    };
  }) : gameInfo.images;
  const { introHead, introFolded } = splitIntroduction(introduction);

  const rows = [
    "🎮 " + translateName,
    name,
    `\n🏭开发商 #${brand}`,
    formatTags("🖥运行平台 ", platform),
    formatTags("🌐语言 ", langTags),
    formatTags("📓剧情分类 ", storyTags),
    formatTags("🌟游戏类型 ", gameTags),
    formatTags("🏷︎内容分类 ", categoryTags),
    `🗓发售日期 ${releaseDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "#$1年$2月 $3日")}`,
    seriesName ? `系列名 #${seriesName}` : "",
    orthrText.trim() ? `\n${orthrText}` : "",
    introHead.length ? `\n📜 —————游戏介绍——————\n` : "",
    ...introHead
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
  console.log(rows + downloadUrlText);
  
  const resultText = escapeMarkdownV2(rows) + introFolded + escapeMarkdownV2(downloadUrlText, ['(', ')']);

  sendTgMessage(configData, { images, message: resultText, messageIds }).then((res) => {
    const ids = (Array.isArray(res) ? res : [res]).map((msg: { message_id: number; }) => msg.message_id);
    const time = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 15);

    if (messageIds) {
      const id = messageIds.join("");
      const index = sendRecord.findIndex(item => item.ids.join("") === id);
      if (index !== -1) sendRecord.splice(index, 1);
    }

    saveSendRecord({ ids, translateName, name, sendTime: time });
  });
};

const splitIntroduction = (introduction: string) => {
  if (!introduction) {
    return { introHead: [], introFolded: "" };
  }
  if (introduction.length > 500) introduction = introduction.slice(0, 500) + "...";

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

  const introFolded = introLines.length ? "\n" + foldText(escapeMarkdownV2(introLines.join("\n"))) : "";

  return { introHead, introFolded, rawText: introLines.join("\n") };
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