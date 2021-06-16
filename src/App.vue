<template>
  <v-app>
    <div>
      <router-view></router-view>
    </div>
  </v-app>
</template>

<script>
// import Tiptap from "./components/tiptap.vue";

</script>

<style>
#app {
}
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
  .editor {
    margin-right: 0;
  }
}
</style>
