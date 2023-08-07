<script setup lang="ts" name="lzyIcon">
import { Icon } from "@iconify/vue";

interface Props {
  name: string;
  width?: string;
  height?: string;
  style?: string | Object;
}

const props = defineProps<Props>();
</script>

<template>
  <Icon
    class="lzyIcon"
    :icon="name"
    :width="props.width ?? '20px'"
    :height="props.height ?? '20px'"
    :style="props.style"
  ></Icon>
</template>

<style scoped>
.lzyIcon {
  cursor: pointer;
  vertical-align: text-bottom;
}
svg{
  display: inline;
}
</style>
