<template>
  <!-- 测试虚拟列表 -->
  <view class="box">
    <o-virtual-list 
      :customStyle="{padding: '0 15px'}" 
      :sourceData="sourceData"
      @scrolltoupper="toupper"
    >
			<template v-slot:visual="{ row }">
				<view class="item" style="background-color: red;">{{ JSON.stringify(row) }}</view>
			</template>
    </o-virtual-list>
  </view>
</template>

<script>
import oVirtualList from '../../component/o-virtual-list/o-virtual-list.vue';
export default {
  components: { oVirtualList },
  name: "test-o-virtual-list",
  data() {
    return {
      sourceData: [],
    };
  },
  created(){
		for(let i = 0; i < 100; i++){
			let r = Math.random() * 10 + "";
			this.sourceData.push("i: " + i + '-' + r.substring(0, Math.floor(Math.random() * (r.length - 1)) + 1));
		};
	},
  methods: {
    toupper(e){
      console.log("触发触顶事件");
    }
  }
};
</script>

<style lang='scss' scoped>
.box {
	width: 100vw;
	height: 100vh;

	.item {
    // height: 60px;
    border: 1px solid #ccc;
		width: 60px;
    word-wrap: break-word;
		background-color: blue;
	}
}
</style>