import { HorizontalLine, VerticalLine } from '@/types/grid-internal'

export function drawHorizontalLine(
  ctx: CanvasRenderingContext2D,
  line: HorizontalLine
) {
  const adaptedY = Math.floor(line.y) + 0.5
  ctx.beginPath()
  ctx.moveTo(line.x1, adaptedY)
  ctx.lineTo(line.x2, adaptedY)
  ctx.stroke()
}

export function drawVerticalLine(
  ctx: CanvasRenderingContext2D,
  line: VerticalLine
) {
  const adaptedX = Math.floor(line.x) + 0.5
  ctx.beginPath()
  ctx.moveTo(adaptedX, line.y1)
  ctx.lineTo(adaptedX, line.y2)
  ctx.stroke()
}

export function drawInCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x + 1, y + 1, w - 1, h - 1)
  ctx.clip()
  return ctx.restore.bind(ctx)
}
