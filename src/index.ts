import { createApp, h } from "vue";
import { searchBox } from "./comps/search";

import "./style/index.css";
import "./style/style.css";
import { gamePreInfoBox } from "./comps/gamePreInfo";
import { gameInfoBox } from "./comps/gameInfo";

const node = {
  render() {
    return [
      h(searchBox),
      h("h2", "GamePreviewInfo"),
      h(gamePreInfoBox),
      h("h2", "GameInfo"),
      h(gameInfoBox)
    ];
  }
};

createApp(node).mount(".app");