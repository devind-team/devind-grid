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
  import { getDefaultColumnNameRow, getDefaultRowNameColumn } from '@/utils'

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

  type HorizontalLine = {
    y: number
    x1: number
    x2: number
  }

  type VerticalLine = {
    y1: number
    y2: number
    x: number
  }

  const props = withDefaults(defineProps<ExcelGridProps>(), {
    width: 500,
    height: 500,
    borderColor: '#A7A7A7',
  })

  const columnNameRow = computed(
    () => props.columnNameRow ?? getDefaultColumnNameRow()
  )
  const rowNameColumn = computed(
    () => props.rowNameColumn ?? getDefaultRowNameColumn()
  )

  const rows = computed<Row[]>(() => [
    { height: columnNameRow.value.height },
    ...props.rows,
  ])
  const columns = computed<Column[]>(() => [
    { width: rowNameColumn.value.width },
    ...props.columns,
  ])

  const horizontalLines = computed<HorizontalLine[]>(() => {
    const result: HorizontalLine[] = []
    let y = 0
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
    let y = 0
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

  const draw = () => {
    const ctx = canvas.value!.getContext('2d')!
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

  const drawRowNames = (ctx: CanvasRenderingContext2D) => {
    ctx.font = rowNameColumn.value.font
    ctx.textAlign = 'center'
    let y = columnNameRow.value.height
    let i = 1
    for (const row of props.rows) {
      const name = rowNameColumn.value.getName(i)
      const textMetrics = ctx.measureText(name)
      ctx.save()
      ctx.beginPath()
      ctx.rect(1, y + 1, rowNameColumn.value.width - 1, row.height - 1)
      ctx.clip()
      ctx.fillText(
        name,
        rowNameColumn.value.width / 2,
        y + row.height / 2 + textMetrics.actualBoundingBoxAscent / 2
      )
      ctx.restore()
      y += row.height
      i += 1
    }
  }

  const drawColumnNames = (ctx: CanvasRenderingContext2D) => {
    ctx.font = columnNameRow.value.font
    ctx.textAlign = 'center'
    let x = rowNameColumn.value.width
    let i = 1
    for (const column of props.columns) {
      const name = columnNameRow.value.getName(i)
      const textMetrics = ctx.measureText(name)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x + 1, 1, column.width - 1, columnNameRow.value.height - 1)
      ctx.clip()
      ctx.fillText(
        name,
        x + column.width / 2,
        columnNameRow.value.height / 2 + textMetrics.actualBoundingBoxAscent / 2
      )
      ctx.restore()
      x += column.width
      i += 1
    }
  }

  const drawHorizontalLine = (
    ctx: CanvasRenderingContext2D,
    line: HorizontalLine
  ) => {
    const adaptedY = Math.floor(line.y) + 0.5
    ctx.beginPath()
    ctx.moveTo(line.x1, adaptedY)
    ctx.lineTo(line.x2, adaptedY)
    ctx.stroke()
  }

  const drawVerticalLine = (
    ctx: CanvasRenderingContext2D,
    line: VerticalLine
  ) => {
    const adaptedX = Math.floor(line.x) + 0.5
    ctx.beginPath()
    ctx.moveTo(adaptedX, line.y1)
    ctx.lineTo(adaptedX, line.y2)
    ctx.stroke()
  }

  onMounted(() => {
    draw()
  })
</script>
