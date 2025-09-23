import { currentGameInfo, currentGameTags, deleteCurrentGameImage, configData, updateConfigDataAt, addCurrentGameInfoTagAt, deleteCurrentGameInfoTagAt, updateCurrentGameInfoAt, telegramMessageIds, updateCurrentGameImageHasSpoiler, addDefaultGameTagAt, removeDefaultGameTagAt, addCurrentGameImage, uploadGameImage } from "@/data";
import { defaultGameTags } from "@/data/defaultData";
import { sendMessage, sendRecord } from "@/data/sendMessage";
import type { GameTags } from "@/types";
import { defineComponent, h, ref, toRaw } from "vue";

const tagElNameItems: [string, keyof GameTags][] = [
  ["运行平台", "platform"],
  ["语言", "langTags"],
  ["剧情分类", "storyTags"],
  ["游戏类型", "gameTypeTags"],
  ["内容", "categoryTags"],
];

export const gameInfoBox = () => {
  return h("section", { class: "game-info" }, [
    h(imagesEl),
    h("ul", { class: "game-info-list-box" }, h(infoListEl)),
    h(bottomEl)
  ]);
};

const imagesEl = {
  setup() {
    const imageUrl = ref("");
    const addImage = () => {
      if (!imageUrl.value || !imageUrl.value.startsWith("http")) return;
      addCurrentGameImage(imageUrl.value);
      imageUrl.value = "";
    };

    const title = () => h("div", { class: "game-info-images-row" }, [
      h("div", { class: "title", style: "margin: 5px 5px 5px 0;font-size: 16px" }, "图片列表"),

      h("input", {
        type: "text", id: "image-url", placeholder: "image url",
        style: "width: 240px;",
        value: imageUrl.value,
        onInput: (e: any) => {
          imageUrl.value = e.target.value;
        },
        onKeydown: (e: any) => {
          if (e.key === "Enter") addImage();
        }
      }),
      h("button", {
        class: "button1",
        style: " margin:0 10px", onClick: addImage
      }, "添加"),
      h("button", { class: "button1", onClick: uploadGameImage }, "上传"),
    ]);

    const imageList = () => h("div", { class: "game-info-images" }, currentGameInfo.images.map(item => {
      return h("div", [
        h("img", { src: item.url, onClick: () => deleteCurrentGameImage(item.url) }),
        h("input", { type: "checkbox", checked: item.has_spoiler, onChange: () => updateCurrentGameImageHasSpoiler(item) })
      ]);
    }));

    return () => h("div", [title(), imageList()]);
  }
};

const infoListEl = {
  setup() {
    const tagType = ref<keyof GameTags>("platform");
    const tagDialogShow = ref(false);
    const tagValue = ref("");

    const toggleTagDialogShow = (tag?: keyof GameTags, value: boolean = false) => {
      tag && (tagType.value = tag);
      tagDialogShow.value = value;
    };

    const addTag = () => {
      if (!tagValue.value) return;
      addDefaultGameTagAt(tagType.value, tagValue.value);
      tagValue.value = "";
    };

    const tagBox = () => [
      h("ul", { class: "tag-list" }, [...currentGameInfo[tagType.value]].map(tag =>
        h("li", { class: "button1", onClick: () => deleteCurrentGameInfoTagAt(tagType.value, tag) }, "#" + tag))
      ),
      h("hr", { style: "width: 100%; margin: 10px 0;border: 2px solid #e5e7eb" }),
      h("ul", { class: "tag-list" }, [...currentGameTags[tagType.value]].map(tag =>
        h("li",
          { class: { "button1": true, "button1-remove": defaultGameTags[tagType.value].includes(tag) }, onClick: () => addCurrentGameInfoTagAt(tagType.value, tag) },
          defaultGameTags[tagType.value].includes(tag) ?
            ["#" + tag, h("span", {
              class: "remove-tag", innerHTML: "&#x2716;", onClick: (e) => {
                e.stopPropagation();
                removeDefaultGameTagAt(tagType.value, tag);
              }
            })]
            : "#" + tag
        ))
      ),
      h("hr", { style: "width: 100%; margin: 10px 0;border: 1px solid #e5e7eb" }),
      h("div", { class: "add-tag" }, [
        h("input", {
          style: "width: 190px; margin-right: 10px",
          type: "text", id: "add-tag", placeholder: "add tag",
          value: tagValue.value,
          onInput: (e: any) => tagValue.value = e.target.value,
          onKeydown: (e: any) => {
            if (e.key === "Enter") addTag();
          }
        }),
        h("button", {
          class: "button1", onClick: addTag
        }, "add")
      ])
    ];

    const list1 = () => [
      h("li", [
        h("div", { class: "title" }, "译名"),
        h("input", {
          type: "text", id: "game-translateName", placeholder: "game translateName",
          value: currentGameInfo.translateName,
          onChange: (e: any) => updateCurrentGameInfoAt("translateName", e.target.value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "游戏名"),
        h("input", {
          type: "text", id: "game-name", placeholder: "game name",
          value: currentGameInfo.name,
          onChange: (e: any) => updateCurrentGameInfoAt("name", e.target.value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "开发商"),
        h("input", {
          type: "text", id: "game-developer", placeholder: "game developer",
          value: currentGameInfo.brand,
          onChange: (e: any) => updateCurrentGameInfoAt("brand", e.target.value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "系列名"),
        h("input", {
          type: "text", id: "series-name", placeholder: "series name",
          value: currentGameInfo.seriesName,
          onChange: (e: any) => updateCurrentGameInfoAt("seriesName", e.target.value)
        })
      ]),
      ...tagElNameItems.map(([name1, name2]) => h("li", [
        h("div", { class: "title" }, name1),
        h("div", [...currentGameInfo[name2]].map(createTagEl)),
        createIconEl(() => toggleTagDialogShow(name2, true))
      ])),
    ];

    const list2 = () => [
      h("li", [
        h("div", { class: "title" }, "发布日期"),
        h("input", {
          type: "text", id: "game-releaseDate", placeholder: "game releaseDate",
          value: currentGameInfo.releaseDate,
          onChange: (e: any) => updateCurrentGameInfoAt("releaseDate", e.target.value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "其他文本"),
        h("textarea", {
          style: "resize: none;",
          id: "orthr-text",
          placeholder: "orthr text",
          value: currentGameInfo.orthrText,
          onChange: (e: Event) => updateCurrentGameInfoAt("orthrText", (e.target as HTMLTextAreaElement).value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "游戏介绍"),
        h("textarea", {
          style: "resize: none;",
          id: "game-introduction",
          placeholder: "game introduction",
          value: currentGameInfo.introduction,
          onChange: (e: Event) => updateCurrentGameInfoAt("introduction", (e.target as HTMLTextAreaElement).value)
        })
      ]),
      h("li", [
        h("div", { class: "title" }, "下载地址"),
        h("textarea", {
          style: "resize: none; height:70px;",
          id: "download-url",
          placeholder: "download url",
          value: currentGameInfo.downloadUrl,
          onChange: (e: any) => updateCurrentGameInfoAt("downloadUrl", e.target.value)
        })
      ])
    ];

    return () => [
      h("ul", { class: "game-info-list" }, list1()),
      h("ul", { class: "game-info-list" }, list2()),
      tagDialogShow.value ? h(createDialog, { title: tagType.value, onShow: toggleTagDialogShow }, tagBox) : null
    ];
  }
};

const bottomEl = {
  setup() {
    const showSettingDialog = ref(false);
    const showSendRecordDialog = ref(false);
    const settingBox = () => {
      return h("ul", { class: "config" }, [
        h("li", [
          h("div", { class: "title" }, "bot token"),
          h("input", {
            type: "text", id: "bot-token", placeholder: "bot token",
            value: configData.botToken,
            onChange: (e: any) => updateConfigDataAt("botToken", e.target.value)
          })
        ]),
        h("li", [
          h("div", { class: "title" }, "chat id"),
          h("input", {
            type: "text", id: "chat-id", placeholder: "chat id",
            value: configData.chatId,
            onChange: (e: any) => updateConfigDataAt("chatId", e.target.value)
          })
        ]),
        h("li", [
          h("div", { class: "title" }, "api url"),
          h("input", {
            type: "text", id: "api-url", placeholder: "api url",
            value: configData.API_Url,
            onChange: (e: any) => updateConfigDataAt("API_Url", e.target.value)
          })
        ]),
        h("li", [
          h("div", { class: "title" }, "dl cookie"),
          h("input", {
            type: "text", id: "dl-cookie", placeholder: "dl cookie",
            value: configData.dlsiteCookie,
            onChange: (e: any) => updateConfigDataAt("dlsiteCookie", e.target.value)
          })
        ])
      ]);
    };

    const recordBox = () => {
      return h("ul", { class: "record" }, sendRecord.map(item => h("li", [
        h("div", { class: "title" }, item.translateName),
        h("div", { class: "title" }, item.name),
        h("div", { class: "title" }, item.sendTime),
        h("input", { readonly: true, value: item.ids.join(" ") })
      ])));
    };

    return () => [
      h("section", { class: "button-list" }, [
        h("div", [
          h("button", { class: "button1", onClick: () => showSendRecordDialog.value = true }, "记录"),
          h("button", { class: "button1", onClick: () => showSettingDialog.value = true }, "设置"),
        ]),
        h("div", [

          h("input", {
            type: "text", id: "delete-message-id", placeholder: "delete message ids",
            value: telegramMessageIds.value,
            onChange: (e: any) => telegramMessageIds.value = e.target.value
          }),
          h("button", { class: "button1", onClick: () => sendMessage(configData, toRaw(currentGameInfo), telegramMessageIds.value) }, "发送"),
        ]),
      ]),
      showSettingDialog.value ? h(createDialog, { title: "设置", onShow: () => showSettingDialog.value = false }, settingBox) : null,
      showSendRecordDialog.value ? h(createDialog, { title: "记录", onShow: () => showSendRecordDialog.value = false }, recordBox) : null
    ];
  }
};

const createIconEl = (showDialog: () => void) => {
  return h('span', { class: 'add-icon', onClick: showDialog }, [
    h('svg', {
      class: 'icon',
      viewBox: '0 0 1024 1024',
      version: '1.1',
      xmlns: 'http://www.w3.org/2000/svg',
      'p-id': '4333',
      width: '32',
      height: '32'
    }, [
      h('path', {
        d: 'M510.3 44.6c63.1 0 124.2 12.3 181.8 36.7 55.6 23.5 105.6 57.2 148.5 100.1s76.6 92.8 100.1 148.5c24.3 57.5 36.7 118.7 36.7 181.8s-12.3 124.2-36.7 181.8c-23.5 55.6-57.2 105.6-100.1 148.5s-93 76.4-148.6 99.9c-57.5 24.3-118.7 36.7-181.8 36.7S386 966.3 328.4 941.9c-55.6-23.5-105.6-57.2-148.5-100.1S103.5 748.9 80 693.3c-24.3-57.5-36.7-118.7-36.7-181.8S55.6 387.4 80 329.8c23.5-55.6 57.2-105.6 100.1-148.5s92.8-76.6 148.5-100.1c57.5-24.3 118.6-36.6 181.7-36.6m0-40c-280 0-507 227-507 507s227 507 507 507 507-227 507-507-227-507-507-507z',
        fill: '#42a5f6',
        'p-id': '4334'
      }),
      h('path', {
        d: 'M510.3 771.6c-11 0-20-9-20-20v-480c0-11 9-20 20-20s20 9 20 20v480c0 11-9 20-20 20z',
        fill: '#42a5f6',
        'p-id': '4335'
      }),
      h('path', {
        d: 'M770.3 511.6c0 11-9 20-20 20h-480c-11 0-20-9-20-20s9-20 20-20h480c11 0 20 9 20 20z',
        fill: '#42a5f6',
        'p-id': '4336'
      })
    ])
  ]);
};

const createTagEl = (name: string) => {
  return h("span", { class: "tag", innerHTML: `#${name}&nbsp` });
};

const createDialog = defineComponent<{ title: string; }, ["show"]>((props, { emit, slots }) => {
  const closeDialog = (e: Event) => {
    e.target === e.currentTarget && emit("show");
  };
  const header = h("div", { class: "dialog-header" }, [
    h("h3", props.title),
    h("div", { onClick: () => emit("show") }, "╳")
  ]);
  return () => h("div", { class: "dialog", onClick: closeDialog }, h("div", { class: "dialog-box" }, [header, slots.default!()]));
}, { props: ['title'] });