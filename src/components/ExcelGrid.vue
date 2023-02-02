<template>
  <canvas ref="canvas" :width="width" :height="height" />
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import {
    ColumnNameRow,
    RowNameColumn,
    Column,
    Row,
    MergedCell,
  } from '@/types'
  import { HorizontalLine, VerticalLine } from '@/types/grid-internal'
  import { useScrolls } from '@/composables'
  import {
    getDefaultColumnNameRow,
    getDefaultRowNameColumn,
    drawHorizontalLine,
    drawVerticalLine,
    drawInCell,
  } from '@/utils'

  export interface ExcelGridProps {
    width?: number
    height?: number
    borderColor?: string
    columnNameRow?: ColumnNameRow
    rowNameColumn?: RowNameColumn
    columns: Column[]
    rows: Row[]
    mergedCells: MergedCell[]
  }

  const props = withDefaults(defineProps<ExcelGridProps>(), {
    width: 500,
    height: 500,
    borderColor: '#A7A7A7',
    columnNameRow: getDefaultColumnNameRow,
    rowNameColumn: getDefaultRowNameColumn,
  })

  const rows = computed<Row[]>(() => [
    { height: props.columnNameRow.height },
    ...props.rows,
  ])
  const columns = computed<Column[]>(() => [
    { width: props.rowNameColumn.width },
    ...props.columns,
  ])

  const scrollHeight = computed(() =>
    rows.value.reduce((acc, row) => acc + row.height, 0)
  )
  const scrollWidth = computed(() =>
    columns.value.reduce((acc, row) => acc + row.width, 0)
  )

  const horizontalLines = computed<HorizontalLine[]>(() => {
    const result: HorizontalLine[] = []
    let y = -scrollTop.value
    for (const [rowIndex, row] of rows.value.entries()) {
      let x = 0
      for (const [columnIndex, column] of columns.value.entries()) {
        const mergedCell = props.mergedCells.find(
          (cell) =>
            cell.minRow < rowIndex &&
            cell.maxRow >= rowIndex &&
            cell.minColumn <= columnIndex &&
            cell.maxColumn >= columnIndex
        )
        if (!mergedCell) {
          result.push({
            y: y,
            x1: x,
            x2: x + column.width,
          })
        }
        if (row === rows.value.at(-1)) {
          result.push({
            y: y + row.height,
            x1: x,
            x2: x + column.width,
          })
        }
        if (column === columns.value.at(-1)) {
          result.at(-1)!.x2 += 1
        }
        x += column.width
      }
      y += row.height
    }
    return result
  })

  const verticalLines = computed<VerticalLine[]>(() => {
    const result: VerticalLine[] = []
    let y = -scrollTop.value
    for (const [rowIndex, row] of rows.value.entries()) {
      let x = 0
      for (const [columnIndex, column] of columns.value.entries()) {
        const mergedCell = props.mergedCells.find(
          (cell) =>
            cell.minColumn < columnIndex &&
            cell.maxColumn >= columnIndex &&
            cell.minRow <= rowIndex &&
            cell.maxRow >= rowIndex
        )
        if (!mergedCell) {
          result.push({
            x: x,
            y1: y,
            y2: y + row.height,
          })
        }
        if (column === columns.value.at(-1)) {
          result.push({
            x: x + column.width,
            y1: y,
            y2: y + row.height,
          })
        }
        if (row === rows.value.at(-1)) {
          result.at(-1)!.y2 += 1
        }
        x += column.width
      }
      y += row.height
    }
    return result
  })

  const canvas = ref<HTMLCanvasElement | null>(null)

  const width = computed(() => props.width)
  const height = computed(() => props.height)

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width.value, height.value)
    drawScrolls(ctx)
    ctx.lineWidth = 1
    ctx.strokeStyle = props.borderColor
    for (const line of horizontalLines.value) {
      drawHorizontalLine(ctx, line)
    }
    for (const line of verticalLines.value) {
      drawVerticalLine(ctx, line)
    }
    drawRowNames(ctx)
    drawColumnNames(ctx)
  }

  const {
    scrollTop,
    scrollLeft,
    draw: drawScrolls,
  } = useScrolls(canvas, width, height, scrollWidth, scrollHeight, draw)

  const drawRowNames = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'black'
    ctx.font = props.rowNameColumn.font
    ctx.textAlign = 'center'
    let y = props.columnNameRow.height - scrollTop.value
    let i = 1
    for (const row of props.rows) {
      const name = props.rowNameColumn.getName(i)
      const textMetrics = ctx.measureText(name)
      const restore = drawInCell(
        ctx,
        0,
        y,
        props.rowNameColumn.width,
        row.height
      )
      ctx.fillText(
        name,
        props.rowNameColumn.width / 2,
        y + row.height / 2 + textMetrics.actualBoundingBoxAscent / 2
      )
      restore()
      y += row.height
      i += 1
    }
  }

  const drawColumnNames = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'black'
    ctx.font = props.columnNameRow.font
    ctx.textAlign = 'center'
    let x = props.rowNameColumn.width
    let i = 1
    for (const column of props.columns) {
      const name = props.columnNameRow.getName(i)
      const textMetrics = ctx.measureText(name)
      const restore = drawInCell(
        ctx,
        x,
        -scrollTop.value,
        column.width,
        props.columnNameRow.height
      )
      ctx.fillText(
        name,
        x + column.width / 2,
        -scrollTop.value +
          props.columnNameRow.height / 2 +
          textMetrics.actualBoundingBoxAscent / 2
      )
      restore()
      x += column.width
      i += 1
    }
  }

  onMounted(() => {
    const ctx = canvas.value!.getContext('2d')!
    draw(ctx)
  })
</script>
