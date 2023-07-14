<template>
	<view class="box">
		<test-o-virtual-list>
		</test-o-virtual-list>
	</view>
</template>

<script>
import TestOVirtualList from '../test1/test-o-virtual-list.vue'
export default {
	components: {TestOVirtualList},
	data() {
		return {}
	},
}
</script>

<style lang="scss" scoped>
.box {
	overflow: hidden;
}
</style>
