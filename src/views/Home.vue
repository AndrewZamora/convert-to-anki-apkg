<template>
  <v-container>
    <v-tabs>
      <v-tab @click="currentTab = 'editor'">Editor</v-tab>
      <v-tab @click="currentTab = 'upload'">Upload</v-tab>
    </v-tabs>
    <div class="textarea-container">
      <div class="editor" v-if="currentTab === 'editor'">
        <h2 class="textarea-title">Markdown to Anki Deck</h2>
        <textarea
          v-model="textareaMd"
          class="textarea"
          @scroll="syncScroll($event)"
          @input="syncScroll($event)"
        ></textarea>
      </div>
      <div v-if="currentTab === 'upload'" class="upload">
        <input type="file" @change="handleFile" accept=".md" />
        <button v-if="html" @click="exportAnkiDeck">Export</button>
      </div>
      <div class="preview-container">
        <h2>Deck Preview</h2>
        <div class="preview" v-html="preview" ref="preview"></div>
      </div>
    </div>
    <div>
      <v-btn color="primary" elevation="2" @click="submit"> Create Deck</v-btn>
    </div>
  </v-container>
</template>

<script>
import marked from "marked";
import { sanitize } from "dompurify";
import AnkiExport from "anki-apkg-export";
import { saveAs } from "file-saver";
export default {
  name: "App",
  data() {
    return {
      currentTab: "editor",
      markdown: "",
      html: "",
      textareaMd: "",
    };
  },
  methods: {
    submit() {
      this.exportAnkiDeck(this.textarea);
    },
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
    async exportAnkiDeck(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
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
    syncScroll(e) {
      this.$refs.preview.scrollTop = e.target.scrollTop;
    },
  },
  computed: {
    preview() {
      const somethingToPreview = this.convertToHTML(this.textareaMd);
      if (somethingToPreview) {
        return sanitize(somethingToPreview);
      }
      return "";
    },
  },
};
</script>

<style>

.textarea {
  height: 50vh;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  font-size: 20px;
  border: solid 2px black;
}
.textarea-container {
  display: flex;
  margin-bottom: 10px;
}

.textarea-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}
.editor {
  flex: 1;
  margin-right: 2em;
}

.preview-container {
  flex: 1;
}

.preview {
  flex: 1;
  word-break: break-all;
  overflow-y: auto;
  hyphens: auto;
  word-wrap: break-word;
  height: 50vh;
  border: solid 2px black;
}

.preview h2 {
  border-bottom: black 2px solid;
  text-align: center;
}

@media screen and (max-width: 500px) {
  .textarea-container {
    flex-direction: column-reverse;
  }
  .preview {
    height: 25vh;
  }
  .textarea {
    height: 25vh;
  }
  .upload {
    flex:none;
    height: 25vh;
  }
  .editor {
    margin-right: 0;
  }
}
</style>