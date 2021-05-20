<template>
  <div id="app">
    <input type="file" @change="handleFile" accept=".md" />
    <button v-if="html" @click="exportAnkiDeck">Export</button>
    <div v-if="markdown" v-html="html"></div>
  </div>
</template>

<script>
import marked from "marked";
import { sanitize } from "dompurify";
import AnkiExport from "anki-apkg-export";
import { saveAs } from "file-saver";

export default {
  name: "App",
  components: {},
  data() {
    return {
      markdown: "",
      html: "",
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
      const apkg = new AnkiExport("testDeck");
      const div = document.createElement("div");
      div.innerHTML = this.html;
      const allH2 = div.querySelectorAll("h2");
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
      saveAs(zip, "testdeck.apkg");
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
