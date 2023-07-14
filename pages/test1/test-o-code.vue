<template>
	<view>
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
import imgInfo from './base64Img';
export default {
	components: { OCode },
	data() {
		return {
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
	methods: {
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
</style>
