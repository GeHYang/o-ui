<template>
	<view class="box">
		<test-o-input></test-o-input>
	</view>
</template>

<script>
	import TestOInput from '../test1/test-o-input.vue'
	import TestOVirtualList from '../test1/test-o-virtual-list.vue'
	export default {
		components: {
			TestOVirtualList,
			TestOInput
		},
		data() {
			return {}
		},
		created() {
		},
		mounted(){
			
		},
	}
</script>

<style lang="scss" scoped>
	.box {
		// overflow: hidden;
	}
</style>
