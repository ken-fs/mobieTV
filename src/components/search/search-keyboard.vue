<template>
  <div class="search_keyboard" @childFocus="childFocus"
    :style="{width: keyboardWidth + 'px'}">

    <div class="search_keyboard_input_root">
      <img :src="ic_search" class="search_keyboard_search_icon" />
      <input class="search_keyboard_input_text" ref="inputRef" type="text" placeholder="请输入首字母拼音" :value="inputText"
        @change="onInputChange" />
    </div>
    <!-- <div class="search_keyboard_search_line" /> -->

    <!--键盘字母列表 - 现在移到按钮上方-->
    <div class="search_keyboard_list" ref="keyboardGrid">
      <div v-for="(item, index) in keyboardItems" :key="index"
        :class="['search_keyboard_item', { 'focused': focusedIndex === index }]"
        @click="keyboardItemClick(item, index)"
        @focus="onItemFocus(index)"
        tabindex="0">
        <span class="search_keyboard_item_text">{{ item.text }}</span>
      </div>
    </div>

    <!-- 清空，退格按钮 - 现在移到字母列表下方-->
    <div class="search_keyboard_input_option_btns">
      <search-btn @click="clearBtnClick"
        search-btn-class="search_keyboard_option_btn" :icon-width="20" :icon-height="20"
        :icon-normal="ic_search_input_clear" :icon-focus="ic_search_input_clear_focus" search-txt-class="btn_text"
        :font-size="18" text="清空" />
      
      <search-btn @click="deleteBtnClick"
        search-btn-class="search_keyboard_option_btn" style="margin-left: 113px;" :icon-width="20" :icon-height="20"
        :icon-normal="ic_search_input_delete" :icon-focus="ic_search_input_delete_focus" search-txt-class="btn_text"
        :font-size="18" text="退格" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, nextTick, onMounted } from "vue"
import SearchBtn from "./search-btn.vue"
import SearchConfig from "@/utils/search/SearchConfig"

// 使用 import 导入图片资源
import ic_search from "@/assets/images/search/ic_search.png"
import ic_search_input_clear from "@/assets/images/search/ic_search_input_clear.png"
import ic_search_input_clear_focus from "@/assets/images/search/ic_search_input_clear_focus.png"
import ic_search_input_delete from "@/assets/images/search/ic_search_input_delete.png"
import ic_search_input_delete_focus from "@/assets/images/search/ic_search_input_delete_focus.png"

export default defineComponent({
  name: "search_keyboard",
  components: {
    SearchBtn
  },
  emits: ["inputChange", "scroll-to-index"],
  setup(props, context) {
    const keyboardWidth = computed(() => SearchConfig.leftWidth)
    const search_keyboard = ref()
    const inputRef = ref()
    let inputText = ref("")
    // 移除 const 声明，直接使用导入的变量
    const keyboardGrid = ref()
    const focusedIndex = ref(-1)
    
    const keyboardItems = [
      { text: "A", type: 1 }, { text: "B", type: 1 }, { text: "C", type: 1 }, { text: "D", type: 1 },
      { text: "E", type: 1 }, { text: "F", type: 1 }, { text: "G", type: 1 }, { text: "H", type: 1 },
      { text: "I", type: 1 }, { text: "J", type: 1 }, { text: "K", type: 1 }, { text: "L", type: 1 },
      { text: "M", type: 1 }, { text: "N", type: 1 }, { text: "O", type: 1 }, { text: "P", type: 1 },
      { text: "Q", type: 1 }, { text: "R", type: 1 }, { text: "S", type: 1 }, { text: "T", type: 1 },
      { text: "U", type: 1 }, { text: "V", type: 1 }, { text: "W", type: 1 }, { text: "X", type: 1 },
      { text: "Y", type: 1 }, { text: "Z", type: 1 }, { text: "1", type: 1 }, { text: "2", type: 1 },
      { text: "3", type: 1 }, { text: "4", type: 1 }, { text: "5", type: 1 }, { text: "6", type: 1 },
      { text: "7", type: 1 }, { text: "8", type: 1 }, { text: "9", type: 1 }, { text: "0", type: 1 }
    ]

    onMounted(() => {
      nextTick(() => {
        // 默认选中第14个元素
        requestDefaultFocus()
      })
    })

    const clearBtnClick = () => {
      if (inputText.value === "") return
      inputText.value = ""
      context.emit("inputChange", "")
    }

    const childFocus = (e) => {
      if (e.target) {
        context.emit("scroll-to-index", 0, 100)
      }
    }

    let isEmpty = false
    const deleteBtnClick = () => {
      if (inputText.value === "") return
      let value = ''
      if (inputText.value && inputText.value.length > 0) {
        inputText.value = inputText.value.slice(0, inputText.value.length - 1)
        value = inputText.value
      } else {
        isEmpty = true
      }
      isEmpty ?? context.emit("inputChange", value)
    }

    const onInputChange = (e: any) => {
      inputText.value = e.target.value
      context.emit("inputChange", inputText.value)
    }

    const keyboardItemClick = (item, index) => {
      // 点击字母时自动填充到输入框
      inputText.value += item.text
      context.emit("inputChange", inputText.value)
      inputRef.value?.focus()
    }

    const onItemFocus = (index) => {
      focusedIndex.value = index
    }

    const requestDefaultFocus = () => {
      if (keyboardGrid.value && keyboardGrid.value.children && keyboardGrid.value.children[14]) {
        keyboardGrid.value.children[14].focus()
        focusedIndex.value = 14
      }
    }

    return {
      search_keyboard,
      inputText,
      keyboardGrid,
      focusedIndex,
      childFocus,
      requestDefaultFocus,
      ic_search,
      ic_search_input_clear,
      ic_search_input_clear_focus,
      ic_search_input_delete,
      ic_search_input_delete_focus,
      clearBtnClick,
      deleteBtnClick,
      keyboardItemClick,
      onItemFocus,
      keyboardWidth,
      inputRef,
      onInputChange,
      keyboardItems
    }
  }
})
</script>

<style src="@/assets/styles/search/search-keyboard.css"></style>
