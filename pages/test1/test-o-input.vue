<template>
	<view class="content">
		<!-- 测试input -->
		<o-input :resize="true" @change="changeIn"></o-input>
		<view class="showInput">
			<rich-text v-for="(item, index) in inText" :key="index" class="richText" :nodes="item"></rich-text>
		</view>
	</view>
</template>

<script>
import oInput from '../../component/o-input/o-input.vue';
export default {
	components: { oInput },
	data() {
		return {
			inText: [],
		}
	},
	mounted(){

	},
	methods: {
		changeIn({text, html, length}){
			this.inText.push(html);
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
