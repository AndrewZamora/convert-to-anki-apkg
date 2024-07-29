<template>
  <div class="dual-list-select_container">
    <div>
      <h2>{{ leftLabel }}</h2>
      <ul>
        <li
          @click="handleClick(item, 'left')"
          v-for="item in leftList"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div>
      <h2>{{ rightLabel }}</h2>
      <ul>
        <li
          @click="handleClick(item, 'right')"
          v-for="item in rightList"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: ["options", "rightLabel", "leftLabel"],
  data() {
    return {
      leftList: [],
      rightList: []
    };
  },
  mounted() {
    console.log("hey");
    this.leftList = this.options;
    console.log(this.leftList, "yo");
			let obj = {}
				obj[`${this.rightLabel}`] = this.rightList
				obj[`${this.leftLabel}`]= this.leftList
      this.$emit("updated",obj);
  },
  methods: {
    handleClick(item, column) {
      this[`${column}List`] = this[`${column}List`].filter(
        listItem => item !== listItem
      );
      let theOtherColumn = `${column === "right" ? "left" : "right"}List`;
      console.log(theOtherColumn);
      this[theOtherColumn] = [...this[theOtherColumn], item];
			let obj = {}
				obj[`${this.rightLabel}`] = this.rightList
				obj[`${this.leftLabel}`]= this.leftList
      this.$emit("updated",obj);
    }
  }
};
</script>
<style>
.dual-list-select_container {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>
