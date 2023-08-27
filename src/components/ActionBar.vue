<script setup lang="ts">
import Adjust from "@/components/actionbarCompontens/Adjust.vue";
import Ratio from "@/components/actionbarCompontens/Ratio.vue";
import Filters from "@/components/actionbarCompontens/Filters.vue";
import Effects from "@/components/actionbarCompontens/Effects.vue";
import Text from "@/components/actionbarCompontens/Text.vue";
import Sticker from "@/components/actionbarCompontens/Sticker.vue";
import watermark from "@/components/actionbarCompontens/Watermark.vue";
import Rotate from "@/components/actionbarCompontens/Rotate.vue";
import Frame from "@/components/actionbarCompontens/Frame.vue";
const props = defineProps<{ activeTool: string }>();
const componentsItems = {
  adjust: Adjust,
  ratio: Ratio,
  filters: Filters,
  effects: Effects,
  text: Text,
  sticker: Sticker,
  watermark: watermark,
  rotate: Rotate,
  frame: Frame,
};
</script>

<template>
  <div class="actionBar">
    <component :is="componentsItems[props.activeTool]"></component>
  </div>
</template>

<style lang="scss">
.actionItemCard {
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 8px;
  user-select: none;
  position: relative;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 10px 0;
  }
}

@media (prefers-color-scheme: dark) {
  .actionItemCard {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(255, 255, 255, 0.1);
  }
}
</style>
