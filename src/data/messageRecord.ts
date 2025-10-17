import type { MessageRecord, GameInfo, TgSendResult, GameTags } from "@/types";
import { defaultGameTags, gameTagKeys } from "./defaultData";
import { deserializeInfo, serializeInfo } from "./tools";
import { reactive, toRaw } from "vue";

export const messageRecord = reactive((() => {
  const result: MessageRecord[] = JSON.parse(localStorage.getItem("sendRecord") ?? "[]");
  if (result.length && !result[0].data) {
    localStorage.removeItem("sendRecord");
    return [];
  }

  result.forEach(p => {
    p.data = deserializeInfo(p.data);
    const tags = {} as GameTags;

    gameTagKeys.forEach(key => {
      const dTag = p.data[key];
      const tag = defaultGameTags[key].filter(t => !dTag.has(t));
      tags[key] = new Set([...tag, ...p.tags[key]]);
    });
    p.tags = tags;
  });

  return result;
})());

export const addMessageRecord = (data: GameInfo, tags: GameTags, tgResults: TgSendResult[]) => {
  const tgResult = tgResults[0];
  const time = new Date(tgResult.date * 1000).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 15);
  const messageLink = `https://t.me/${tgResult.chat.username}/${tgResult.message_id}`;
  const ids = tgResults.map((msg) => msg.message_id);
  const imageNumber = data.images.length;

  deleteMessageRecord(ids);
  data.images = data.images.filter(p => !p.file);
  data.ids = ids;
  messageRecord.unshift({ data, tags, messageIds: ids, sendTime: time, messageLink, imageNumber });
  saveMessageRecord();
};

export const updateMessageRecord = (data: GameInfo, tags: GameTags) => {
  const item = deleteMessageRecord(data.ids!);
  if (item) {
    if (!data.images.length) data.images = item.data.images;
    item.data = data;
    item.tags = tags;

    messageRecord.unshift(item);
    saveMessageRecord();
  }
};

export const deleteMessageRecord = (ids: number[] = []) => {
  const idsStr = ids.toString();
  if (!idsStr) return undefined;

  const index = messageRecord.findIndex(item => item.messageIds.toString() === idsStr);
  const item = messageRecord[index];
  if (index !== -1) messageRecord.splice(index, 1);

  saveMessageRecord();
  return item;
};

const saveMessageRecord = () => {
  if (messageRecord.length > 200) messageRecord.pop();
  const list = toRaw(messageRecord).map(p => {
    const { data, tags, ...v } = p;
    return {
      ...v,
      data: serializeInfo(data),
      tags: serializeInfo(tags)
    };
  });
  localStorage.setItem("sendRecord", JSON.stringify(list));
};