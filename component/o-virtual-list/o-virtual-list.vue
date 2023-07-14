<template>
  <!-- 虚拟列表 -->
  <view class="o-virtual-list">
    <scroll-view 
			:scroll-top="scrollTop" 
			scroll-y
			class="s-view"
			@scroll="scrollEvent"
			@scrolltoupper="toupperEvent"
			@scrolltolower="tolowerEvent"
		>
			<!-- 可视区域 -->
			<view class="visual-box" :style="{top: top + 'px', ...customStyle}">
				<view
					class="visual" 
					:class="'visual_' + index" 
					v-for="(item, index) in visualList" 
					:key="index"
					:style="{height: !estimatedHeight ? itemHeight + 'px' : ''}"
				><slot name="visual" :row="{index: item.index, data: item.data}"></slot></view>
			</view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: "o-virtual-list",
	props: {
		sourceData: {
			type: Array,
			default: () => {return []}
		},
		itemHeight: {
			type: Number|Boolean,
			default: 60
		},
		estimatedHeight: {
			type: Number,
			require: true,
			default: 0
		},
		customStyle: {
			type: Object,
			default: () => {return {}}
		},
	},
  data() {
    return {
      scrollTop: 0,
			visualList: [],
			top: 0,
			startIndex: 0,
			endIndex: 0,
			listData: [],
    };
  },
  mounted(){
		this.listData = JSON.parse(JSON.stringify(this.sourceData));
		if(this.estimatedHeight){
			// 初始化列表信息
			this.listData = this.initDataList(this.listData);
			this.$nextTick(async () => {
				this.getVisualList1();
			})
		} else {
			this.listData = this.listData.map((item, index) => {
				return {
					index,
					data: item
				}
			})
			this.$nextTick(async () => {
				let sView = await this.querySelector(".s-view");
				this.endIndex = Math.ceil(sView.height / this.itemHeight) + 2;
				this.getVisualList();
			})
		}
  },
	methods: {
		async getVisualList(){
			this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
			let endIndex = Math.ceil(this.scrollTop / this.itemHeight) + 2;
			endIndex = Math.max(this.endIndex, endIndex);
			this.visualList = this.listData.slice(this.startIndex, this.startIndex + endIndex);
			this.top = this.scrollTop - (this.scrollTop % this.itemHeight)
		},
		async getVisualList1(){
			let sView = await this.querySelector(".s-view");
			let endIndex = Math.ceil(sView.height / this.estimatedHeight);
			
			this.visualList = this.listData.slice(this.startIndex, this.startIndex + endIndex);
			this.top = this.visualList[0].top;
			this.$nextTick(() => {
				this.updatePosition();
			})

		},
		scrollEvent(e){
			this.scrollTop = e.detail.scrollTop;
			if(!this.estimatedHeight){
				this.getVisualList();
			}
			else {
				this.startIndex = this.getStartIndex(this.scrollTop);
				this.getVisualList1();
			}
		},
		querySelector(name){
			return new Promise((res) => {
				const query = uni.createSelectorQuery().in(this);
				query.select(name).fields({
					rect: true,
					size: true,
					scrollOffset: true,
				}, data => {
					res(data)
				}).exec();
			})
		},
		initDataList(list){
			return list.map((item, index) => {
				return {
					index,
					data: item,
					height: this.estimatedHeight,
					top: (index) * this.estimatedHeight,
					bottom: (index + 1) * this.estimatedHeight
				}
			})
		},
		getStartIndex(scrollTop){
			// let item = this.listData.find(i => i && i.bottom > scrollTop);
			let item = this.binarySearch(this.listData, scrollTop);
			return item.index;
		},
		binarySearch(list, scrollTop){
			let start = 0;
			let end = list.length - 1;
			let maxIndex = -1;
			while(start <= end){
				let min = (start + end) >> 1;
				if(list[min].bottom == scrollTop){
					return list[min + 1];
				} else if(list[min].bottom < scrollTop){
					start = min + 1;
				} else {
					if(maxIndex === -1 || maxIndex > min){
						maxIndex = min;
					}
					end = min - 1;
				}
			}
			return list[maxIndex];
		},
		updatePosition(){
			return new Promise((res) => {
				this.visualList.map(async (item, index) => {
					let node = await this.querySelector(".visual_" + index);
					let oldHeight = item.height;
					let newHeight = node.height;
					const diff = newHeight - oldHeight;
					if(diff){
						this.listData[item.index].height = newHeight;
						this.listData[item.index].bottom += diff;
						// 减少执行次数
						let count = Math.min(item.index + this.visualList.length * 1.5, this.listData.length);
						for(let i = item.index + 1; i < count; i++){
							this.listData[i].top = this.listData[i-1].bottom;
							this.listData[i].bottom += diff;
						}
					}
				});
				res(true);
			})
		},
		toupperEvent(e){
			this.$emit("scrolltoupper", e)
		},
		tolowerEvent(e){
			this.$emit("scrolltolower", e)
		}
	}
};
</script>

<style lang='scss' scoped>
* {
  box-sizing: border-box;
}
.o-virtual-list {
  height: 100%;
	::v-deep .uni-scroll-view-refresh-inner {
		z-index: 100;
	}
  .s-view {
		position: relative;
    height: 100%;
		width: 100%;
		.visual-box {
			position: absolute;
			height: 100%;
			width: 100%;
			.visual {
				overflow: hidden;
				width: 100%;
			}
		}
  }
}
</style>