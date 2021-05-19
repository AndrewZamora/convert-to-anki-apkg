<template>
  <div id="app">
    <input type="file" @change="handleFile" accept=".md" />
    <button v-if="html" @click="convert">Convert</button>
    <div v-if="markdown" v-html="html"></div>
  </div>
</template>

<script>
import marked from "marked";
import { sanitize } from 'dompurify';

export default {
  name: "App",
  components: {},
  data() {
    return {
      markdown: "",
      html:""
    };
  },
  methods: {
    handleFile(event) {
      const file  = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        this.markdown = sanitize(e.target.result);
      });
      reader.addEventListener("loadend", ()=> {
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
    convert(){
      const div = document.createElement("div");
      div.innerHTML = this.html;
      const allH2 = div.querySelectorAll("h2");
      [...allH2].forEach(tag => {
        console.log(tag.nextElementSibling)
      })
    }
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
