import type { TelegramData } from "@/types";

type Info = { images: string[], message: string; messageIds?: (string | number)[]; };
type MessageParams = { type: string; media: string; caption?: string; parse_mode?: string; };
const TELEGRAM_API = `https://api.telegram.org/bot`;

export const sendTgMessage = async (telegramData: TelegramData, info: Info) => {
  if (info.messageIds?.length) {
    await deleteMessage(telegramData, info.messageIds!);
  }

  if (info.images.length === 1) {
    return sendPhoto(telegramData, info);
  }

  const media: MessageParams[] = info.images.map((image) => ({
    type: "photo",
    media: image
  }));
  media[0].caption = info.message;
  media[0].parse_mode = "MarkdownV2";

  return send("sendMediaGroup", telegramData.botToken, {
    chat_id: telegramData.chatId,
    media
  });
};

const sendPhoto = async (telegramData: TelegramData, info: Info) => {
  const body = {
    chat_id: telegramData.chatId,
    photo: info.images[0],
    caption: info.message,
    parse_mode: "MarkdownV2",
  };

  return send("sendPhoto", telegramData.botToken, body);
};

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

