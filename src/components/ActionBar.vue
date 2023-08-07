<script setup lang="ts">
import Adjust from "@/components/actionbarCompontens/Adjust.vue";
import Ratio from "@/components/actionbarCompontens/Ratio.vue";
import Filters from "@/components/actionbarCompontens/Filters.vue";
import Text from "@/components/actionbarCompontens/Text.vue";
import Sticker from "@/components/actionbarCompontens/Sticker.vue";
import Crop from "@/components/actionbarCompontens/Crop.vue";
import Rotate from "@/components/actionbarCompontens/Rotate.vue";
import Blur from "@/components/actionbarCompontens/Blur.vue";
import Beauty from "@/components/actionbarCompontens/Beauty.vue";
import Frame from "@/components/actionbarCompontens/Frame.vue";
import Mosaic from "@/components/actionbarCompontens/Mosaic.vue";
import Graffiti from "@/components/actionbarCompontens/Graffiti.vue";
const props = defineProps<{ activeTool: string }>();
const componentsItems = {
  adjust: Adjust,
  ratio: Ratio,
  filters: Filters,
  text: Text,
  sticker: Sticker,
  crop: Crop,
  rotate: Rotate,
  blur: Blur,
  beauty: Beauty,
  frame: Frame,
  mosaic: Mosaic,
  graffiti: Graffiti,
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
  border: 1px solid var(--themeColor);
  padding: 8px;
  margin-bottom: 8px;
  user-select: none;

  h3 {
    margin: 0 0 10px 0;
  }
}
</style>
