import { useEventListener } from '@vueuse/core'
import { computed, ref, Ref, watch } from 'vue'

const ARROW_BLOCK_SIZE = 17
const THUMB_SIZE = 13
const CLEAR_COLOR = 'white'
const BACKGROUND_COLOR = '#f1f1f1'
const ARROW_BLOCK_HOVER_COLOR = '#d2d2d2'
const THUMB_COLOR = '#c1c1c1'
const PASSIVE_PIXEL = [0xa3, 0xa3, 0xa3, 0xff]
const ACTIVE_PIXEL = [0x80, 0x80, 0x80, 0xff]

export function useScrolls(
  canvas: Ref<HTMLCanvasElement | null>,
  width: Ref<number>,
  height: Ref<number>,
  scrollWidth: Ref<number>,
  scrollHeight: Ref<number>,
  drawAll: (ctx: CanvasRenderingContext2D) => void
) {
  const isVerticalScrollVisible = computed(
    () => scrollHeight.value > height.value
  )
  const isHorizontalScrollVisible = computed(
    () => scrollWidth.value > width.value
  )

  const { position: scrollTop, draw: drawVerticalScroll } = useVerticalScroll(
    canvas,
    width,
    height,
    scrollHeight,
    isVerticalScrollVisible,
    isHorizontalScrollVisible,
    drawAll
  )

  const { position: scrollLeft, draw: drawHorizontalScroll } =
    useHorizontalScroll(
      canvas,
      width,
      height,
      scrollWidth,
      isHorizontalScrollVisible,
      isVerticalScrollVisible,
      drawAll
    )

  const draw = (ctx: CanvasRenderingContext2D) => {
    drawVerticalScroll(ctx)
    drawHorizontalScroll(ctx)
  }

  return { scrollTop, scrollLeft, draw }
}

function useVerticalScroll(
  canvas: Ref<HTMLCanvasElement | null>,
  width: Ref<number>,
  height: Ref<number>,
  scrollHeight: Ref<number>,
  isVisible: Ref<boolean>,
  isShort: Ref<boolean>,
  drawAll: (ctx: CanvasRenderingContext2D) => void
) {
  watch(isVisible, () => {
    const ctx = canvas.value!.getContext('2d')!
    drawAll(ctx)
  })

  const position = ref(0)
  watch(position, () => {
    const ctx = canvas.value!.getContext('2d')!
    drawAll(ctx)
  })

  const isTopHover = ref(false)
  const isBottomHover = ref(false)

  const topBackground = computed(() =>
    isTopHover.value ? ARROW_BLOCK_HOVER_COLOR : BACKGROUND_COLOR
  )
  const bottomBackground = computed(() =>
    isBottomHover.value ? ARROW_BLOCK_HOVER_COLOR : BACKGROUND_COLOR
  )

  watch(isTopHover, () => {
    const ctx = canvas.value!.getContext('2d')!
    drawTopArrowBlock(ctx, false)
  })
  watch(isBottomHover, () => {
    const ctx = canvas.value!.getContext('2d')!
    drawBottomArrowBlock(ctx, false)
  })

  const thumbHeight = ref(50)

  const drawTopArrowBlock = (
    ctx: CanvasRenderingContext2D,
    isPassive: boolean
  ) => {
    ctx.fillStyle = topBackground.value
    ctx.fillRect(
      width.value - ARROW_BLOCK_SIZE,
      0,
      ARROW_BLOCK_SIZE,
      ARROW_BLOCK_SIZE
    )
    const imageData = ctx.getImageData(width.value - 12, 7, 7, 4)
    const pixel = isPassive ? PASSIVE_PIXEL : ACTIVE_PIXEL
    for (let line = 0; line < 4; line++) {
      let index = line * 28 + 12 - line * 4
      for (let i = 0; i < 1 + line * 2; i++) {
        for (let shift = 0; shift < 4; shift++) {
          imageData.data[index + shift] = pixel[shift]
        }
        index += 4
      }
    }
    ctx.putImageData(imageData, width.value - 12, 7)
  }

  const drawTrack = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(
      width.value - ARROW_BLOCK_SIZE,
      ARROW_BLOCK_SIZE,
      ARROW_BLOCK_SIZE,
      height.value - ARROW_BLOCK_SIZE * 2
    )
    drawThumb(ctx)
  }

  const drawThumb = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = THUMB_COLOR
    ctx.fillRect(
      width.value - ARROW_BLOCK_SIZE / 2 - THUMB_SIZE / 2,
      ARROW_BLOCK_SIZE + position.value,
      THUMB_SIZE,
      thumbHeight.value
    )
  }

  const drawBottomArrowBlock = (
    ctx: CanvasRenderingContext2D,
    isPassive: boolean
  ) => {
    ctx.fillStyle = bottomBackground.value
    ctx.fillRect(
      width.value - ARROW_BLOCK_SIZE,
      height.value - ARROW_BLOCK_SIZE,
      ARROW_BLOCK_SIZE,
      ARROW_BLOCK_SIZE
    )
    const imageData = ctx.getImageData(
      width.value - 12,
      height.value - 11,
      7,
      4
    )
    const pixel = isPassive ? PASSIVE_PIXEL : ACTIVE_PIXEL
    for (let line = 0; line < 4; line++) {
      let index = line * 28 + line * 4
      for (let i = 0; i < 7 - line * 2; i++) {
        for (let shift = 0; shift < 4; shift++) {
          imageData.data[index + shift] = pixel[shift]
        }
        index += 4
      }
    }
    ctx.putImageData(imageData, width.value - 12, height.value - 11)
  }

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!isVisible.value) {
      ctx.fillStyle = CLEAR_COLOR
      ctx.fillRect(
        width.value - ARROW_BLOCK_SIZE,
        0,
        ARROW_BLOCK_SIZE,
        height.value
      )
      return
    }
    ctx.imageSmoothingEnabled = false
    drawTopArrowBlock(ctx, false)
    drawTrack(ctx)
    drawBottomArrowBlock(ctx, false)
  }

  useEventListener(canvas, 'mousemove', (e: MouseEvent) => {
    isTopHover.value =
      e.offsetX > width.value - ARROW_BLOCK_SIZE && e.offsetY < ARROW_BLOCK_SIZE
    isBottomHover.value =
      e.offsetX > width.value - ARROW_BLOCK_SIZE &&
      e.offsetY > height.value - ARROW_BLOCK_SIZE
  })
  useEventListener(canvas, 'mouseleave', () => {
    isTopHover.value = false
    isBottomHover.value = false
  })
  useEventListener('mouseleave', () => {
    isTopHover.value = false
    isBottomHover.value = false
  })

  useEventListener(canvas, 'click', () => {
    if (isTopHover.value) {
      position.value = Math.max(position.value - 3, 0)
    }
    if (isBottomHover.value) {
      position.value += 3
    }
  })

  return { position, draw }
}

function useHorizontalScroll(
  canvas: Ref<HTMLCanvasElement | null>,
  width: Ref<number>,
  height: Ref<number>,
  scrollWidth: Ref<number>,
  isShort: Ref<boolean>,
  isVisible: Ref<boolean>,
  drawAll: (ctx: CanvasRenderingContext2D) => void
) {
  const position = ref(0)

  const draw = (ctx: CanvasRenderingContext2D) => {
    console.log(canvas, width, height, scrollWidth, isShort, drawAll, ctx)
  }

  return { position, draw }
}
