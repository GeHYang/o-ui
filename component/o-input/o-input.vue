<template>
  <view class="o-input" @click="editorBlur" :style="{width: inputStyle.width}">
    <view class="container" :style="{...inputStyle, width: '100%'}">
      <view class="l-prefix">
        <slot name="prefix"/>
      </view>
      <editor id="editor" 
        class="ql-container"
        @ready="onEditorReady" 
        :placeholder="placeholder"
        @click.stop="editorFocus"
        @input="inputText"
        @blur="editorBlur"
      ></editor>
      <view class="r-icon" @click.stop="showEmoji">
        <slot name="suffix">
          <image class="d-icon" mode="aspectFit" src="./1.png"></image>
        </slot>
      </view>
      <view class="btn">
        <slot name="r-btn">
          <button class="submit-btn" :class="inText.length || 'no-text-btn'" 
            :disabled="!inText.length" size="mini" type="primary" @click.stop="submit"
          >发送</button>
        </slot>
      </view>
    </view>
    <view v-show="showEmojiBox" class="emoji-box" :style="emojiStyle">
      <o-emoji @click="insertEmoji"></o-emoji>
    </view>
  </view>
</template>

<script>
import oEmoji from './o-emoji/o-emoji.vue';
import { parseToText, parseToHtml } from './util';
export default {
  components: { oEmoji },
  name: "o-input",
  data() {
    return {
      showEmojiBox: false,
      inText: "",
      inFlag: false,
    };
  },
  mounted(){
    
  },
  methods: {
    showEmoji(){
      this.showEmojiBox = !this.showEmojiBox;
    },
    insertEmoji(emoji) {
      this.$emit("clickEmoji", emoji);
      this.showEmojiBox = false;
      this.editorCtx.insertImage({
        src: emoji.src,
        width: this.eSize,
        height: this.eSize,
        extClass: 'emoji',
        data: {
          name: emoji.regName
        }
      })
    },
    submit(){
      let detail = {...this.inText};
      detail.html = parseToHtml(detail.text);
      this.$emit("change", detail);
      this.editorCtx.clear();
    },
    inputText(e) {
      this.getContents().then(res =>{
        this.inText = res;
        this.$emit("input", this.inText.text)
      })
    },
    getContents(){
      return new Promise((resolve) => {
        this.editorCtx.getContents({
          success: (res) => {
            let inText = parseToText(res.html);
            resolve(inText)
          }
        })
      })
    },
    editorFocus(e){
      if(!this.resize) return;
      this.showEmojiBox = false;
    },
    editorBlur(){
      if(!this.clickBlankBlur) return;
      this.showEmojiBox = false;
    },
    onEditorReady() {
      uni.createSelectorQuery().select('#editor').context((res) => {
        this.editorCtx = res.context
      }).exec()
    },
  },
  props: {
    width: {
      type: String,
      default: "100vw"
    },
    height: {
      type: String,
      default: "30"
    },
    emojiSize: {
      type: String,
      default: "20"
    },
    fontSize: {
      type: Number,
      default: 16
    },
    clickBlankBlur: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    emojiStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    resize: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    inputStyle(){
      let regx = /[a-zA-Z%]/;
      let style = {
        width: this.width,
        height: this.height,
        fontSize: this.fontSize,
        minHeight: this.height,
        lineHeight: this.height
      }
      if(!regx.test(this.width)){
        style.width = this.width + 'px';
      }
      if(!regx.test(this.height)){
        style.height = this.height + 'px';
        style.minHeight = this.height + 'px';
        style.lineHeight = this.height + 'px';
      }
      return style;
    },
    eSize(){
      let regx = /[a-zA-Z%]/;
      if(!regx.test(this.emojiSize)){
        return this.emojiSize + 'px';
      }
      return this.emojiSize
    }
  },
};
</script>

<style lang='scss' scoped>
*{
  box-sizing: border-box;
}
.o-input {
  padding: 5px 5px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;

  .container {
    font-size: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #aaa;
    overflow: hidden;

    .ql-container {
      font-size: inherit;
      display: block;
      min-height: inherit;
			max-height: 100%;
			padding: 0 5px;
			outline: none;
      line-height: inherit;
      flex: 1;

      ::v-deep .ql-blank:before {
				font-style: initial;
				top: 50%;
				transform: translateY(-50%);
			}
      ::v-deep p {
        display: flex;
        align-items: center;
        height: inherit;
      }
    }

    .r-icon {
      display: flex;
      align-items: center;
      padding: 0 5px;
      border-left: 1px solid #ccc;
      .d-icon{
        width: 20px;
        height: 20px;
      }
    }

    .btn {
      height: 100%;
      padding: 2px;
      .submit-btn {
        width: 45px;
        height: 100%;
        font-size: 10px;
        border-radius: 0;
        border: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        &::after {
          border: none;
        }
        &:active {
          background-color: green;
        }
      }
      .no-text-btn {
        background-color: rgb(228, 228, 228);
        color: black;
        &:active {
          background-color: rgb(228, 228, 228);
        }
      }
    }
  }
  .emoji-box{
    width: 100%;
    background-color: #efefef;
  }
}
</style>