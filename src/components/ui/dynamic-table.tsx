'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, Trash2 } from 'lucide-react'

interface DynamicTableProps {
  onMatrixChange: (matrix: number[][]) => void
  initialSize?: number
}

export default function DynamicTable({ onMatrixChange, initialSize = 3 }: DynamicTableProps) {
  const [size, setSize] = useState(initialSize)
  const [matrix, setMatrix] = useState<(number | '')[][]>(() => {
    const initial = Array(initialSize).fill(null).map(() => Array(initialSize).fill(''))
    // Set diagonal to 0
    for (let i = 0; i < initialSize; i++) {
      initial[i][i] = 0
    }
    return initial
  })
  const [speciesNames, setSpeciesNames] = useState<string[]>(
    Array(initialSize).fill(null).map((_, i) => `Species${i + 1}`)
  )

  const updateMatrix = (newMatrix: (number | '')[][], newNames: string[]) => {
    setMatrix(newMatrix)
    setSpeciesNames(newNames)
    
    // Convert to number matrix and call callback
    const numberMatrix: number[][] = newMatrix.map(row => 
      row.map(cell => typeof cell === 'number' ? cell : 0)
    )
    onMatrixChange(numberMatrix)
  }

  const addRowColumn = () => {
    const newSize = size + 1
    const newMatrix = matrix.map(row => [...row, ''])
    newMatrix.push(Array(newSize).fill(''))
    
    // Set diagonal to 0 for new row/column
    newMatrix[newSize - 1][newSize - 1] = 0
    
    const newNames = [...speciesNames, `Species${newSize}`]
    
    setSize(newSize)
    updateMatrix(newMatrix as (number | '')[][], newNames)
  }

  const removeRowColumn = () => {
    if (size <= 2) return
    
    const newSize = size - 1
    const newMatrix = matrix.slice(0, newSize).map(row => row.slice(0, newSize))
    const newNames = speciesNames.slice(0, newSize)
    
    setSize(newSize)
    updateMatrix(newMatrix, newNames)
  }

  const updateCell = (row: number, col: number, value: string) => {
    const newMatrix = [...matrix]
    const numValue = value === '' ? '' : parseFloat(value)
    
    if (row === col) {
      // Diagonal should always be 0
      newMatrix[row][col] = 0
      newMatrix[col][row] = 0
    } else {
      // Update both symmetric positions
      newMatrix[row][col] = numValue
      newMatrix[col][row] = numValue
    }
    
    updateMatrix(newMatrix, speciesNames)
  }

  const updateSpeciesName = (index: number, name: string) => {
    const newNames = [...speciesNames]
    newNames[index] = name || `Species${index + 1}`
    updateMatrix(matrix, newNames)
  }

  const clearMatrix = () => {
    const newMatrix = Array(size).fill(null).map(() => Array(size).fill(''))
    // Set diagonal to 0
    for (let i = 0; i < size; i++) {
      newMatrix[i][i] = 0
    }
    updateMatrix(newMatrix, speciesNames)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Distance Matrix Input
          <div className="flex gap-2">
            <Button onClick={addRowColumn} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={removeRowColumn} 
              size="sm" 
              variant="outline" 
              disabled={size <= 2}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button onClick={clearMatrix} size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Species Names Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Species Names:</label>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
              {speciesNames.map((name, index) => (
                <Input
                  key={index}
                  value={name}
                  onChange={(e) => updateSpeciesName(index, e.target.value)}
                  placeholder={`Species ${index + 1}`}
                  className="text-center text-sm"
                />
              ))}
            </div>
          </div>

          {/* Distance Matrix */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-2 bg-gray-50 text-xs"></th>
                  {speciesNames.map((name, index) => (
                    <th key={index} className="border border-gray-200 p-1 bg-gray-50 text-xs font-medium">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-200 p-1 bg-gray-50 text-xs font-medium text-center">
                      {speciesNames[rowIndex]}
                    </td>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-200 p-1">
                        {rowIndex === colIndex ? (
                          <div className="w-12 h-8 flex items-center justify-center bg-gray-100 text-xs">
                            0
                          </div>
                        ) : rowIndex < colIndex ? (
                          <Input
                            type="number"
                            value={cell === '' ? '' : cell.toString()}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="w-12 h-8 text-xs text-center p-1"
                            step="0.1"
                            min="0"
                          />
                        ) : (
                          <div className="w-12 h-8 flex items-center justify-center bg-gray-50 text-xs">
                            {matrix[colIndex][rowIndex] === '' ? '-' : matrix[colIndex][rowIndex]}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>• Only fill the upper right half of the matrix (above diagonal)</p>
            <p>• The matrix is automatically mirrored to maintain symmetry</p>
            <p>• Diagonal values are always 0 (distance from species to itself)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}