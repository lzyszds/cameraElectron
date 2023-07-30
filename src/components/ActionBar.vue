<script setup lang="ts">
import { useStore } from "@/store/store";
import Adjust from "@/components/actionbarCompontens/Adjust.vue";
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
const state = useStore();
const componentsItems = {
  adjust: Adjust,
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
    <component :is="componentsItems[state.actionToolsValue]"></component>
  </div>
</template>

<style lang="scss" scoped></style>
