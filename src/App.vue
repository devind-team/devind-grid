<template>
  <ExcelGrid :columns="columns" :rows="rows" />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ColumnNameRow, Column, Row } from '@/types'
  import ExcelGrid from '@/components/ExcelGrid.vue'

  const columns = ref<Column[]>([
    { width: 50 },
    { width: 100 },
    { width: 75 },
    { width: 25 },
  ])
  const rows = ref<Row[]>([
    { height: 25 },
    { height: 30 },
    { height: 35 },
    { height: 30 },
    { height: 25 },
  ])
</script>
