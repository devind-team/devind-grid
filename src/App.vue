<template>
  <ExcelGrid :columns="columns" :rows="rows" :merged-cells="mergedCells" />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Column, Row, MergedCell } from '@/types'
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
  const mergedCells = ref<MergedCell[]>([
    { minColumn: 2, minRow: 2, maxColumn: 3, maxRow: 2 },
    { minColumn: 3, minRow: 4, maxColumn: 4, maxRow: 5 },
  ])
</script>
