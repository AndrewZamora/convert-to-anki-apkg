<template>
  <v-container>
    <div class="textarea-container">
      <div :class="[csv ? 'uploaded' : 'upload']">
        <div class="deck-name-input" v-if="selectionFinished">
          <v-text-field
            v-if="csv"
            label="Deck Name"
            v-model="deckName"
            :rules="rules"
            hide-details="auto"
          ></v-text-field>
        </div>
        <div v-if="csv && !selectionFinished">
          <h2>Select Cards</h2>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="parsedCSV"
            :single-select="false"
            item-key="front"
            show-select
          >
          </v-data-table>
          <v-btn color="primary" elevation="2" @click="selectCards"
            >Submit</v-btn
          >
        </div>
        <input v-if="!csv" type="file" @change="handleFile" accept=".csv" />
      </div>
      <div v-if="csv && !selectionFinished" class="preview-container">
        <dualListSelect
          :leftLabel="leftLabel"
          :rightLabel="rightLabel"
          :options="titles"
          @updated="handleUpdate"
        />
      </div>
    </div>
    <div>
      <v-btn
        v-if="selectionFinished"
        color="primary"
        elevation="2"
        @click="submit"
        >Create Deck</v-btn
      >
    </div>
  </v-container>
</template>

<script>
import marked from "marked";
import { sanitize } from "dompurify";
import AnkiExport from "anki-apkg-export";
import { saveAs } from "file-saver";
import dualListSelect from "../components/dual-list-select";
export default {
  name: "App",
  components: {
    dualListSelect,
  },
  data() {
    return {
      deckName: "test",
      rules: [
        (value) => !!value || "Required.",
        (value) => (value && value.length >= 3) || "Min 3 characters",
      ],
      markdown: "",
      html: "",
      textareaMd: "",
      csv: "",
      selected: [],
      selectionFinished: false,
      front: [],
      back: [],
      leftLabel: "Front",
      rightLabel: "Back",
    };
  },
  methods: {
    submit() {
      this.exportCSVToAnkiDeck();
    },
    async handleFile(event) {
      const [file] = event.target.files;
      const { name } = file;
      const fileType = name.split(".").pop();
      console.log(file);
      console.log(`${file},${fileType}`);
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        if (fileType === "md") {
          this.markdown = sanitize(e.target.result);
        }
      });
      reader.addEventListener("loadend", (e) => {
        if (fileType === "csv") {
          const md = this.parseCSVToMarkdown(e.target.result);
          this.csv = e.target.result;
          this.html = this.convertToHTML(md);
        }
        if (fileType === "md") {
          this.html = this.convertToHTML(this.markdown);
        }
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
    parseCSVToMarkdown(csv) {
      const [, ...data] = csv.split("\n");
      let markdown = [];
      data.forEach((row) => {
        if (row.length > 0) {
          const [front, back] = row.split(",");
          const newCard = `## ${front}\n${back}\n`;
          markdown = [...markdown, newCard];
        }
      });
      console.log(markdown.join(""));
      return markdown.join("");
    },
    syncScroll(e) {
      this.$refs.preview.scrollTop = e.target.scrollTop;
    },
    async exportCSVToAnkiDeck() {
      if (this.deckName.length > 3) {
        const apkg = new AnkiExport(this.deckName);
        this.parsedCSV.forEach((item) => {
          let front = [];
          let back = [];
          Object.keys(item).forEach((key) => {
            if (this.front.includes(key)) {
              front.push(item[key]);
            }
            if (this.back.includes(key)) {
              back.push(item[key]);
            }
          });
          apkg.addCard(front.join("<br>"), back.join("<br>"));
        });
        const zip = await apkg
          .save()
          .catch((err) => console.log(err.stack || err));
        saveAs(zip, `${this.deckName}.apkg`);
      }
    },
    async createAnkiDeck(name, cards) {
      const apkg = new AnkiExport(name);
      cards.forEach((item) => {
        const { front, back } = item;
        apkg.addCard(front, back);
      });
      const zip = await apkg
        .save()
        .catch((err) => console.log(err.stack || err));
      saveAs(zip, `${this.deckName}.apkg`);
    },
    selectCards() {
      this.selectionFinished = true;
    },
    handleUpdate(update) {
      this.front = update.Front;
      this.back = update.Back;
    },
  },
  computed: {
    headers() {
      if (!this.csv.length) return null;
      const [row] = this.csv.split("\n");
      const titles = row.split(",");
      return titles.map((title) => {
        return { text: title, value: title };
      });
    },
    titles() {
      if (!this.csv.length) return null;
      const [row] = this.csv.split("\n");
      return row.split(",");
    },
    preview() {
      const somethingToPreview = this.convertToHTML(this.textareaMd);
      if (somethingToPreview && this.currentTab === "editor") {
        return sanitize(somethingToPreview);
      }
      if (this.currentTab === "upload") {
        return this.html;
      }
      return "";
    },
    htmlString() {
      let htmlString = "";
      if (this.markdown) {
        marked.setOptions({
          // Creates <br> for line carriages (new lines)
          gfm: true,
          breaks: true,
        });
        htmlString = marked(this.markdown);
      }
      return htmlString;
    },
    parsedCSV() {
      if (!this.headers.length && !this.csv.length) return null;
      const [, ...data] = this.csv.split("\n");
      const columns = data
        .filter((row) => row != "")
        .map((row) => {
          const column = row.split(",");
          return column;
        });
      const parsed = columns.map((column) => {
        let obj = {};
        column.forEach((item, index) => {
          obj[this.headers[index].value] = item;
        });
        return obj;
      });
      return parsed;
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

.deck-name-input {
  margin-bottom: 1em;
}

.uploaded {
  display: flex;
  flex: 1;
  margin-right: 1em;
  flex-direction: column;
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
    flex: none;
    height: 25vh;
  }
  .editor {
    margin-right: 0;
  }
}
</style>
