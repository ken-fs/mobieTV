<template>
  <div 
    :class="[searchBtnClass, { 'focused': isFocused }]"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
    tabindex="0">
    <div :style="{width: iconWidth + 'px', height: iconHeight + 'px'}">
      <img 
        :style="{width: iconWidth + 'px', height: iconHeight + 'px', position: 'absolute'}" 
        :src="isFocused ? iconFocus : iconNormal" />
    </div>
    <span :class="searchTxtClass" :style="{ fontSize: fontSize + 'px' }">{{ text }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
  name: "search-btn",
  props: {
    searchBtnClass: String,
    searchTxtClass: String,
    iconWidth: {
      type: Number,
      default: 0
    },
    iconHeight: {
      type: Number,
      default: 0
    },
    iconNormal: {
      type: String,
      default: ""
    },
    iconFocus: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    },
    fontSize: {
      type: Number,
      default: 0
    }
  },
  emits: ["click"],
  setup(props, context) {
    const isFocused = ref(false)
    
    const onClick = () => {
      context.emit("click")
    }
    
    const onFocus = () => {
      isFocused.value = true
    }
    
    const onBlur = () => {
      isFocused.value = false
    }

    return {
      isFocused,
      onClick,
      onFocus,
      onBlur
    }
  }
})
</script>

<style scoped>
/* 已使用Tailwind类 */
</style>
