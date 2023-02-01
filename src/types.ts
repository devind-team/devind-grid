export type ColumnNameRow = {
  height: number
  font: string
  getName: (index: number) => string
}

export type RowNameColumn = {
  width: number
  font: string
  getName: (index: number) => string
}

export type Column = {
  width: number
}

export type Row = {
  height: number
}
