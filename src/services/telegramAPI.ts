import type { ConfigData, GameInfoImages } from "@/types";

type Info = { images: GameInfoImages[], message: string; };
type sendData = Omit<Info, "messageIds">;
type MessageParams = { type: string; media: string; caption?: string; parse_mode?: string; has_spoiler: boolean; };
type TelegramData = Omit<ConfigData, "API_Url">;
const TELEGRAM_API = `https://api.telegram.org/bot`;

export const sendTgMessage = async (telegramData: TelegramData, info: Info) => {
  if (info.images.length === 1) {
    return sendPhoto(telegramData, info);
  }

  return sendMediaGroup(telegramData, info);
};

export const deleteTgMessage = async (telegramData: TelegramData, ids: (number | string)[]) => {
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

export const editMessage = async (telegramData: TelegramData, info: sendData, ids: number[]) => {
  const { chatId, botToken } = telegramData;
  const { message, images } = info;

  if (!images.length) {
    await send("editMessageCaption", telegramData.botToken, {
      chat_id: telegramData.chatId,
      message_id: ids[0],
      caption: message,
      parse_mode: "MarkdownV2",
    });
    return;
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const id = ids[i];

    const isLocal = image.file || image.url.includes("imgProxy");
    const media: MessageParams = { type: 'photo', media: image.url, has_spoiler: image.has_spoiler };
    if (i === 0) {
      media.caption = message;
      media.parse_mode = "MarkdownV2";
    }

    if (isLocal) {
      const data = image.file || await (await fetch(image.url)).blob();
      const mediaName = `attach://newphoto${i}`;
      media.media = mediaName;

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('message_id', "" + id);
      formData.append(`newphoto${i}`, data);
      formData.append('media', JSON.stringify(media));

      sendFormData("editMessageMedia", botToken, formData);
    } else {
      await send("editMessageMedia", telegramData.botToken, {
        chat_id: telegramData.chatId,
        message_id: id,
        media
      });
    }
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