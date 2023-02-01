import { ColumnNameRow, RowNameColumn } from '@/types/grid'
import { positionToLetter } from './excel'

export function getDefaultColumnNameRow(): ColumnNameRow {
  return {
    height: 25,
    font: `700 16px "Roboto",sans-serif`,
    getName: getDefaultColumnName,
  }
}

export function getDefaultColumnName(index: number): string {
  return positionToLetter(index)
}

export function getDefaultRowNameColumn(): RowNameColumn {
  return {
    width: 30,
    font: `700 16px "Roboto",sans-serif`,
    getName: getDefaultRowName,
  }
}

export function getDefaultRowName(index: number): string {
  return String(index)
}
