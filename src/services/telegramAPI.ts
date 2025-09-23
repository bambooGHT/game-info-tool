import type { ConfigData, GameInfoImages } from "@/types";

type Info = { images: GameInfoImages[], message: string; messageIds?: (string | number)[]; };
type sendData = Omit<Info, "messageIds">;
type MessageParams = { type: string; media: string; caption?: string; parse_mode?: string; };
type TelegramData = Omit<ConfigData, "API_Url">;
const TELEGRAM_API = `https://api.telegram.org/bot`;

const deleteMessage = async (telegramData: TelegramData, ids: (number | string)[]) => {
  for (const item of ids) {
    await fetch(`${TELEGRAM_API}${telegramData.botToken}/deleteMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramData.chatId,
        message_id: item
      })
    });
  }
};

const send = async (api: string, token: string, body: any) => {
  const res = await fetch(`${TELEGRAM_API}${token}/${api}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.result;
};

const sendFormData = async (api: string, token: string, formData: FormData) => {
  const res = await fetch(`${TELEGRAM_API}${token}/${api}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.result;
};

export const sendTgMessage = async (telegramData: TelegramData, info: Info) => {
  if (info.messageIds?.length) {
    await deleteMessage(telegramData, info.messageIds!);
  }

  if (info.images.length === 1) {
    return sendPhoto(telegramData, info);
  }

  return sendMediaGroup(telegramData, info);
};

const sendPhoto = async (telegramData: TelegramData, info: sendData) => {
  const { chatId, botToken } = telegramData;
  const { message, images } = info;
  const { file, has_spoiler, url } = images[0];

  if (file || url.includes("imgProxy")) {
    const data = file || await (await fetch(url)).blob();
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', data);
    formData.append('parse_mode', "MarkdownV2");
    formData.append('caption', message);
    formData.append('has_spoiler', String(has_spoiler));

    return sendFormData("sendPhoto", botToken, formData);
  } else {
    const body = {
      chat_id: telegramData.chatId,
      photo: info.images[0].url,
      has_spoiler: info.images[0].has_spoiler,
      caption: info.message,
      parse_mode: "MarkdownV2",
    };

    return send("sendPhoto", telegramData.botToken, body);
  }
};

const sendMediaGroup = async (telegramData: TelegramData, info: sendData) => {
  const { chatId, botToken } = telegramData;
  const { message, images } = info;

  const isSendFormData = info.images.some(p => p.file || p.url.includes("imgProxy"));

  if (isSendFormData) {
    const formData = new FormData();
    const media: MessageParams[] = await Promise.all(info.images.map(async (item, index) => {
      const { file, has_spoiler, url } = item;
      let media = url;

      if (file || url.includes("imgProxy")) {
        const data = file || await (await fetch(url)).blob();
        console.log(data);
        media = `attach://image${index}`;
        formData.append(`image${index}`, data);
      }
      const mediaItem = { type: 'photo', media, has_spoiler };
      return mediaItem;
    }));

    media[0].caption = message;
    media[0].parse_mode = "MarkdownV2";

    formData.append('chat_id', chatId);
    formData.append('media', JSON.stringify(media));
    console.log(media);

    return sendFormData("sendMediaGroup", botToken, formData);
  } else {
    const media: MessageParams[] = images.map((item) => ({
      type: "photo",
      media: item.url,
      has_spoiler: item.has_spoiler
    }));
    media[0].caption = message;
    media[0].parse_mode = "MarkdownV2";

    return send("sendMediaGroup", botToken, {
      chat_id: chatId,
      media
    });
  }
};