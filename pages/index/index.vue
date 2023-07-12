<template>
	<view class="content">
		<!-- 测试input -->
		<!-- <o-input :resize="true" @change="changeIn"></o-input>
		<view class="showInput">
			<rich-text v-for="(item, index) in inText" :key="index" class="richText" :nodes="item"></rich-text>
		</view> -->
		<!-- 测试滑动验证码 -->
		<o-code
			:bg="bg" 
      :slider="slider"
			closeable
			closeOnClickOverlay
			:overlayOpacity="0.3"
			channelText="滑动完成验证"
			endToStart
			@change="changeCode"
			@close="closeCode"
			@refresh="refreshCode"
		></o-code>
	</view>
</template>

<script>
import OCode from '../../component/o-code/o-code.vue';
import oInput from '../../component/o-input/o-input.vue';
import imgInfo from './base64Img';
export default {
	components: { oInput, OCode },
	data() {
		return {
			title: 'Hello',
			inText: [],
			text: "",
			bg: {
				src: imgInfo.bgImg,
        width: 240,
        height: 150,
        mode: "aspectFit"
			},
			slider: {
				src: imgInfo.slider,
				y: imgInfo.scale * 150, // y轴坐标
        width: 40,
        height: 40
			},
		}
	},
	mounted(){

	},
	methods: {
		changeIn({text, html, length}){
			this.inText.push(html);
		},
		changeCode(detail){
			console.log(detail);
		},
		closeCode(e){
			console.log(e);
		},
		refreshCode(e){
			console.log(e);
		}
	}
}
</script>

<style lang="scss" scoped>
	.content {
		height: calc(100vh - 45px);
		position: relative;
		.showInput {
			position: absolute;
			top: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			.richText {
				line-height: 30px;
				::v-deep img {
					vertical-align: middle;
				}
			}
		}
	}
</style>
