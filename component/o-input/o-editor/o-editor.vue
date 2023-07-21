<template>
	<view class="o-editor">
		<view class="_blank">
			<view 
				placeholder="请输入内容" 
				:addImg="status" 
				:change:addImg="editorRender.insertImage"
				@blur="blurEvent"
				@focus="focusEvent" 
				class="editor" 
				contenteditable="true">
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "o-editor",
		data() {
			return {
				content: "",
				status: false,
				clearContent: false,
			};
		},
		mounted() {
			this.$emit("onReady", {
				insertImage: this.insertImage,
				clear: this.clearContentFun,
			});
		},
		methods: {
			inputContent(data) {
				this.content = data.content;
				this.$emit("input", this.content);
			},
			insertImage(value) {
				this.status = JSON.stringify({
					value,
					timer: new Date().getTime(),
					type: 'img'
				});
			},
			blurEvent(e) {
				this.$emit("blur", e);
			},
			focusEvent(e) {
				this.$emit("focus", e);
			},
			clearContentFun() {
				this.status = JSON.stringify({type: 'clear'});
				setTimeout(() => {
					this.status = "";
				}, 200)
			},

		},
	};
</script>

<script module="editorRender" lang="renderjs">
	export default {
		name: "o-editor",
		data() {
			return {
				enterFlag: 2
			};
		},
		mounted() {
			let editor = document.querySelector(".editor");
			editor.addEventListener("keydown", this.keydownEvent);
			editor.addEventListener("keyup", this.keyupEvent);
			editor.addEventListener("click", this.clickInput);
		},
		methods: {
			clearContent(){
				let editor = document.querySelector(".editor");
				editor.innerHTML = "";
				this.keyupEvent();
			},
			keydownEvent(e) {
				if (e.keyCode === 13) {
					if (++this.enterFlag < 2) {
						e.preventDefault();
						return false;
					}
					this.enterFlag = -1;
					return false;
				}
			},
			keyupEvent(e) {
				let editor = document.querySelector(".editor");
				let content = editor.innerHTML;
				if (e && e.keyCode === 13) {
					let range = window.getSelection().getRangeAt(0);
					range.endContainer.setAttribute("name", "o---input---div---")
				}
				this.callMethod('inputContent', content)
			},
			callMethod(methodName, value) {
				this.$ownerInstance.callMethod(methodName, {
					content: value
				})
			},
			async insertImage(newValue) {
				if (!newValue) {
					return;
				}
				let options = JSON.parse(newValue);
				if(options.type === 'clear'){
					this.clearContent();
					return;
				}
				options = options.value
				if (!options.src) {
					options.fail && options.fail("src cannot be empty");
					return;
				}
				let img = document.createElement("img");
				img.src = options.src;
				img.setAttribute("style", `width: ${options.width}; height: ${options.height};`);
				img.setAttribute("alt", options.alt);
				img.setAttribute("class", options.extClass);
				await this.serialization(options.data, img);
				this.insertImg(img);
				options.success && options.success(true);
				options.complete && options.complete('end');
			},
			insertImg(el) {
				const editor = document.querySelector(".editor");
				var selection = window.getSelection(); // 获取光标
				if ( // 如果没有焦点或者焦点不在输入框内，聚焦到输入框
					selection.anchorNode !== editor &&
					!editor.contains(selection.anchorNode)
				) {
					// 聚焦到输入框
					selection.removeAllRanges();
					editor.focus();
					if (editor.lastChild)
						selection.getRangeAt(0).setStartAfter(editor.lastChild);
					selection.collapseToEnd();
				}

				let range = selection.getRangeAt(0);
				range.deleteContents();

				range.insertNode(el);
				range = range.cloneRange();
				range.setStartAfter(el);
				range.collapse();
				selection.removeAllRanges();
				selection.addRange(range);
				this.keyupEvent();
			},
			// 序列化字符串：key=value;key=value
			serialization(data, el) {
				return new Promise((resovle) => {
					if (data instanceof Object) {
						let str = "";
						const keys = Object.keys(data);
						if (!keys || keys.length == 0) {
							return '';
						}
						for (const key of keys) {
							el.setAttribute(key, data[key]);
						}
					}
					resovle(true)
				})
			},
			// 点击输入框内容是设置光标
			clickInput(e) {
				if (!(e.target instanceof HTMLImageElement)) {
					return;
				}
				let target = e.target;
				// 获取点击图片的中心位置
				let targetX = target.x + Math.floor(target.width / 2);

				let selection = window.getSelection(); // 获取光标
				let range = selection.getRangeAt(0);

				range = range.cloneRange();
				if (e.x < targetX) {
					range.setStartBefore(target);
					range.setEndBefore(target);
				} else {
					range.setStartBefore(target);
					range.setEndAfter(target);
				}

				range.collapse();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	};
</script>

<style lang='scss' scoped>
	.o-editor {
		width: 100%;
		height: 100%;
		background-color: transparent;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		._blank {
			box-sizing: border-box;
			overflow: hidden;
			overflow-y: scroll;
			width: 100%;
			line-height: 25px;

			.editor {
				height: fit-content;
				width: 100%;
				outline: none;
				word-wrap: break-word;
				word-break: break-all;
				flex-wrap: wrap;

				&:empty::after {
					content: attr(placeholder);
					color: #b4b4b4;
				}

				::v-deep div {
					display: flex;
					align-items: center;

					img {
						vertical-align: middle;
					}
				}

				::v-deep img {
					vertical-align: middle;
				}


			}
		}
	}
</style>
