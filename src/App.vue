<template>
  <div id="app">
    <input type="file" @change="handleFile" accept=".md" />
    <div v-if="markdown" v-html="html"></div>
  </div>
</template>

<script>
import marked from "marked";

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
        this.markdown = e.target.result;
      });
      reader.addEventListener("loadend", ()=> {
        this.html = this.convertToHTML(this.markdown);
      });
      reader.readAsBinaryString(file);
    },
    convertToHTML(md) {
      marked.setOptions({
        // Creates <br> for line carriages (new lines)
        gfm: true,
        breaks: true,
      });
      return marked(md);
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
