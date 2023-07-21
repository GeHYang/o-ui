<template>
  <view class="o-emoji">
    <view class="emoji-list" :style="boxStyle">
      <image 
        v-for="(item, index) in emojis" 
        :key="index" 
        mode="aspectFit"
        @click.stop="clickEmoji(item)"
        :src="item.src"
      />
    </view>
  </view>
</template>

<script>
import { emojiList } from './emoji.js';
export default {
  name: "o-emoji",
  data() {
    return {
      emojis: emojiList,
      boxStyle: "",
    };
  },
  async mounted(){
    this.boxStyle = {};
    this.$nextTick(async () => {
      let res = await this.querySelect(".o-emoji");
      this.boxStyle = res;
    })
  },
  methods: {
    querySelect(name){
      return new Promise((res) => {
        const query = uni.createSelectorQuery().in(this);
        query.select(name).boundingClientRect(data => {
          let w = data.width;
          if(w % 31 != 0){
            let p = Math.floor((w / 31));
            p = w - (p * 31);
            res({padding: `10px ${p / 2}px`});
            return;
          }
          res({});
        }).exec();
      })
    },
    clickEmoji(emoji){
      this.$emit("click", emoji);
    }
  }
};
</script>

<style lang='scss' scoped>
.o-emoji {
  .emoji-list {
    box-sizing: border-box;
    max-height: 250px;
    overflow: hidden;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    image {
      width: 25px;
      height: 25px;
      margin: 3px;
    }
  }
}
</style>