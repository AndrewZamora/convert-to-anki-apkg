<template>
  <div id="app">
    <input type="file" @change="handleFile" accept=".md" />
    <button v-if="html" @click="exportAnkiDeck">Export</button>
    <div class="textarea">
      <div class="editor">
        <tiptap v-model="textarea" />
      </div>
      <div class="preview" v-if="preview" v-html="preview"></div>
    </div>
  </div>
</template>

<script>
import marked from "marked";
import { sanitize } from "dompurify";
import AnkiExport from "anki-apkg-export";
import { saveAs } from "file-saver";
import Tiptap from "./components/tiptap.vue";

export default {
  name: "App",
  components: { Tiptap },
  data() {
    return {
      markdown: "",
      html: "",
      textarea: "",
    };
  },
  methods: {
    handleFile(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        this.markdown = sanitize(e.target.result);
      });
      reader.addEventListener("loadend", () => {
        this.html = this.convertToHTML(this.markdown);
      });
      reader.readAsText(file);
    },
    convertToHTML(md) {
      marked.setOptions({
        // Creates <br> for line carriages (new lines)
        gfm: true,
        breaks: true,
      });
      return marked(md);
    },
    async exportAnkiDeck() {
      const div = document.createElement("div");
      div.innerHTML = this.html;
      const allH2 = div.querySelectorAll("h2");
      const h1 = div.querySelector("h1");
      const deckName = h1.textContent;
      const apkg = new AnkiExport(deckName);
      [...allH2].forEach((tag) => {
        const {
          textContent: front,
          nextElementSibling: { textContent: back },
        } = tag;
        apkg.addCard(front, back);
      });
      const zip = await apkg
        .save()
        .catch((err) => console.log(err.stack || err));
      saveAs(zip, `${deckName}.apkg`);
    },
  },
  computed: {
    preview() {
      if (this.textarea) {
        return sanitize(this.textarea);
      }
      return "";
    },
  },
};
</script>

<style>
#app {
}
.textarea {
  display: flex;
}

.editor {
  flex: 1;
  margin-right: 2em;
}

.preview {
  flex: 1;
}

.preview h2 {
  border-bottom: black 2px solid;
}
</style>
