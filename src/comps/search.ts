import { getGamePreviewInfo, resetData, SearchText } from "@/data";
import { h } from "vue";

export const searchBox = () => {
  return h("div", { class: "search-box" }, [
    h("input", {
      type: "search",
      id: "search-game",
      placeholder: "search game",
      onInput: (e: any) => SearchText.value = e.target.value,
      onChange: resetData,
      onKeydown: (e: any) => e.key === "Enter" && getGamePreviewInfo(SearchText.value)
    }),
    h("button", { class: "button1", onclick: () => getGamePreviewInfo(SearchText.value) }, "search")
  ]);
};