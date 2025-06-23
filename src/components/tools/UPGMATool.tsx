'use client'

import React, { useState } from 'react'
import Fraction from 'fraction.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { TreePine, Calculator, Info, Plus, Trash2, ArrowDown, Target } from 'lucide-react'
import DynamicTable from '@/components/ui/dynamic-table'

interface DistanceMatrix {
  [key: string]: { [key: string]: number }
}

interface FractionMatrix {
  [key: string]: { [key: string]: Fraction }
}

interface ClusterNode {
  name: string
  height: number
  children?: ClusterNode[]
  isLeaf: boolean
  x?: number
  y?: number
}

interface Step {
  stepNumber: number
  description: string
  matrix: DistanceMatrix
  fractionMatrix?: FractionMatrix
  minDistance: number
  clusteredSpecies: string[]
  newCluster: string
  calculations?: { [key: string]: CalculationDetail }
}

interface CalculationDetail {
  species: string
  calculation: string
  result: string
  decimal: number
}

interface DNASequence {
  id: string
  sequence: string
}

// Custom tree visualization component
const TreeVisualization = ({ tree, width = 600, height = 400 }: { 
  tree: ClusterNode, 
  width?: number, 
  height?: number 
}) => {
  const margin = { top: 60, right: 50, bottom: 80, left: 50 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get all leaf nodes to determine positioning
  const getLeaves = (node: ClusterNode): ClusterNode[] => {
    if (node.isLeaf) return [node]
    if (!node.children) return []
    return node.children.flatMap(getLeaves)
  }

  const leaves = getLeaves(tree)
  const maxHeight = tree.height

  // Position nodes - vertical orientation like your image
  const positionNodes = (node: ClusterNode, leafIndex: { value: number }): ClusterNode => {
    if (node.isLeaf) {
      // Leaves at the bottom (présent), distributed horizontally
      return {
        ...node,
        x: leafIndex.value++ * (innerWidth / (leaves.length - 1)),
        y: innerHeight // Bottom of the tree (présent)
      }
    }

    const positionedChildren = node.children?.map(child => positionNodes(child, leafIndex)) || []
    // Average X position of children
    const avgX = positionedChildren.reduce((sum, child) => sum + (child.x || 0), 0) / positionedChildren.length
    // Y position based on height (inverted - higher height = higher up in tree)
    const y = innerHeight - (node.height / maxHeight) * innerHeight

    return {
      ...node,
      children: positionedChildren,
      x: avgX,
      y: y
    }
  }

  const positionedTree = positionNodes(tree, { value: 0 })

  // Render tree lines - triangular style
  const renderLines = (node: ClusterNode): React.JSX.Element[] => {
    if (!node.children || node.children.length === 0) return []

    const lines: React.JSX.Element[] = []
    const nodeX = (node.x || 0) + margin.left
    const nodeY = (node.y || 0) + margin.top

    node.children.forEach((child, index) => {
      const childX = (child.x || 0) + margin.left
      const childY = (child.y || 0) + margin.top

      // Draw diagonal line from parent to child (triangular style)
      lines.push(
        <line
          key={`line-${node.name}-${index}`}
          x1={nodeX}
          y1={nodeY}
          x2={childX}
          y2={childY}
          stroke="#333"
          strokeWidth="2"
        />
      )

      // Add edge length labels on all lines
      const midX = (nodeX + childX) / 2
      const midY = (nodeY + childY) / 2
      const edgeLength = node.height - child.height
      if (edgeLength > 0) {
        lines.push(
          <text
            key={`edge-${node.name}-${index}`}
            x={midX + 10}
            y={midY - 5}
            fontSize="11"
            fill="#666"
            textAnchor="middle"
            className="fill-current"
          >
            {edgeLength.toFixed(1)}
          </text>
        )
      }

      // Recursively render child lines
      lines.push(...renderLines(child))
    })

    return lines
  }

  // Render leaf node labels and circles
  const renderLabels = (node: ClusterNode): React.JSX.Element[] => {
    const labels: React.JSX.Element[] = []

    if (node.isLeaf) {
      const x = (node.x || 0) + margin.left
      const y = (node.y || 0) + margin.top
      
      // Draw circle for leaf node
      labels.push(
        <circle
          key={`circle-${node.name}`}
          cx={x}
          cy={y}
          r="15"
          fill="white"
          stroke="#333"
          strokeWidth="2"
        />
      )
      
      // Draw label inside circle
      labels.push(
        <text
          key={`label-${node.name}`}
          x={x}
          y={y + 5}
          fontSize="14"
          fill="#333"
          textAnchor="middle"
          fontWeight="bold"
        >
          {node.name}
        </text>
      )
    }

    if (node.children) {
      node.children.forEach(child => {
        labels.push(...renderLabels(child))
      })
    }

    return labels
  }

  // Horizontal grid lines and time scale
  const timeLabels = []
  for (let i = 0; i <= 4; i++) {
    const y = margin.top + (i / 4) * innerHeight
    const timeValue = maxHeight - (i / 4) * maxHeight
    timeLabels.push(
      <g key={`time-${i}`}>
        <line 
          x1={margin.left} 
          y1={y} 
          x2={width - margin.right} 
          y2={y} 
          stroke="#ddd" 
          strokeWidth="1" 
        />
        <text 
          x={width - margin.right + 10} 
          y={y + 5} 
          fontSize="12" 
          fill="#666"
        >
          {i}
        </text>
      </g>
    )
  }

  return (
    <div className="w-full">
      <svg width={width} height={height} className="border rounded">
        {/* Grid lines and time scale */}
        {timeLabels}
        
        {/* Tree lines */}
        {renderLines(positionedTree)}
        
        {/* Node labels and circles */}
        {renderLabels(positionedTree)}
        
        {/* Axis labels */}
        <text x={20} y={margin.top - 10} fontSize="16" fill="#333" fontWeight="bold">
          passé
        </text>
        <text x={20} y={height - 20} fontSize="16" fill="#333" fontWeight="bold">
          présent
        </text>
      </svg>
    </div>
  )
}

export default function UPGMATool() {
  const [sequences, setSequences] = useState<DNASequence[]>([
    { id: '1', sequence: '' },
    { id: '2', sequence: '' }
  ])
  const [matrixData, setMatrixData] = useState<number[][]>([[]])
  const [result, setResult] = useState<{
    steps: Step[]
    tree: ClusterNode | null
    distances?: DistanceMatrix
  } | null>(null)
  const [error, setError] = useState('')

  // Validate DNA sequence - only allow A, C, T, G
  const validateDNASequence = (sequence: string): string => {
    const cleaned = sequence.toUpperCase()
    const validChars = /^[ACTG]*$/
    if (!validChars.test(cleaned)) {
      throw new Error('DNA sequence can only contain A, C, T, G characters')
    }
    return cleaned
  }

  // Calculate Hamming distance between two sequences
  const calculateHammingDistance = (seq1: string, seq2: string): number => {
    const cleanSeq1 = validateDNASequence(seq1)
    const cleanSeq2 = validateDNASequence(seq2)
    
    if (cleanSeq1.length !== cleanSeq2.length) {
      throw new Error(`Sequences must be of equal length. Seq1: ${cleanSeq1.length}, Seq2: ${cleanSeq2.length}`)
    }
    
    let distance = 0
    for (let i = 0; i < cleanSeq1.length; i++) {
      if (cleanSeq1[i] !== cleanSeq2[i]) {
        distance++
      }
    }
    return distance
  }

  // Create distance matrix from sequences
  const createDistanceMatrixFromSequences = (seqs: DNASequence[]): DistanceMatrix => {
    const matrix: DistanceMatrix = {}
    
    const cleanedSeqs = seqs.map((seq, index) => ({
      ...seq,
      name: `Seq${index + 1}`,
      sequence: validateDNASequence(seq.sequence)
    }))

    for (let i = 0; i < cleanedSeqs.length; i++) {
      matrix[cleanedSeqs[i].name] = {}
      for (let j = 0; j < cleanedSeqs.length; j++) {
        if (i === j) {
          matrix[cleanedSeqs[i].name][cleanedSeqs[j].name] = 0
        } else {
          matrix[cleanedSeqs[i].name][cleanedSeqs[j].name] = calculateHammingDistance(
            cleanedSeqs[i].sequence, 
            cleanedSeqs[j].sequence
          )
        }
      }
    }
    
    return matrix
  }

  // Convert number matrix to distance matrix
  const convertNumberMatrixToDistanceMatrix = (matrix: number[][]): DistanceMatrix => {
    const distMatrix: DistanceMatrix = {}
    const size = matrix.length
    
    for (let i = 0; i < size; i++) {
      const speciesName = `Species${i + 1}`
      distMatrix[speciesName] = {}
      for (let j = 0; j < size; j++) {
        const targetName = `Species${j + 1}`
        distMatrix[speciesName][targetName] = matrix[i][j] || 0
      }
    }
    
    return distMatrix
  }

  // Find minimum distance in matrix
  const findMinDistance = (matrix: DistanceMatrix): { min: number, pair: string[] } => {
    let min = Infinity
    let pair: string[] = []
    
    const species = Object.keys(matrix)
    for (let i = 0; i < species.length; i++) {
      for (let j = i + 1; j < species.length; j++) {
        const distance = matrix[species[i]][species[j]]
        if (distance < min && distance > 0) {
          min = distance
          pair = [species[i], species[j]]
        }
      }
    }
    
    return { min, pair }
  }

  // Helper function to format fractions
  const formatFraction = (numerator: number, denominator: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator))
    const num = numerator / divisor
    const den = denominator / divisor
    return den === 1 ? `${num}` : `${num}/${den}`
  }

  // Convert distance matrix to fraction matrix
  const createFractionMatrix = (distMatrix: DistanceMatrix): FractionMatrix => {
    const fracMatrix: FractionMatrix = {}
    Object.keys(distMatrix).forEach(row => {
      fracMatrix[row] = {}
      Object.keys(distMatrix[row]).forEach(col => {
        fracMatrix[row][col] = new Fraction(distMatrix[row][col])
      })
    })
    return fracMatrix
  }

  // Perform UPGMA clustering with exact fraction calculations
  const performUPGMA = (initialMatrix: DistanceMatrix): { steps: Step[], tree: ClusterNode } => {
    // Convert to fraction matrix for exact calculations
    let fractionMatrix: FractionMatrix = createFractionMatrix(initialMatrix)
    let matrix = JSON.parse(JSON.stringify(initialMatrix))
    let clusters: { [key: string]: ClusterNode } = {}
    let clusterSizes: { [key: string]: number } = {}
    const steps: Step[] = []
    let stepNumber = 1

    // Initialize clusters
    Object.keys(matrix).forEach(species => {
      clusters[species] = { name: species, height: 0, isLeaf: true }
      clusterSizes[species] = 1
    })

    while (Object.keys(clusters).length > 1) {
      const { min, pair } = findMinDistance(matrix)
      if (pair.length === 0) break

      const [species1, species2] = pair
      const newClusterHeight = min / 2
      const newClusterName = `(${species1},${species2})`
      
      const newCluster: ClusterNode = {
        name: newClusterName,
        height: newClusterHeight,
        children: [clusters[species1], clusters[species2]],
        isLeaf: false
      }

      // Calculate exact fractions for new distances
      const calculations: { [key: string]: CalculationDetail } = {}
      const remainingSpecies = Object.keys(fractionMatrix).filter(s => s !== species1 && s !== species2)

      for (const species of remainingSpecies) {
        const size1 = new Fraction(clusterSizes[species1] || 1)
        const size2 = new Fraction(clusterSizes[species2] || 1)
        const dist1 = fractionMatrix[species1][species]
        const dist2 = fractionMatrix[species2][species]
        
        // UPGMA formula: (d1*n1 + d2*n2) / (n1 + n2)
        const numerator = dist1.mul(size1).add(dist2.mul(size2))
        const denominator = size1.add(size2)
        const result = numerator.div(denominator)
        
        calculations[species] = {
          species,
          calculation: `(${dist1.toFraction()} × ${size1.toFraction()} + ${dist2.toFraction()} × ${size2.toFraction()}) / (${size1.toFraction()} + ${size2.toFraction()}) = ${numerator.toFraction()} / ${denominator.toFraction()}`,
          result: result.toFraction(),
          decimal: parseFloat(result.valueOf().toFixed(2))
        }
      }

                    // Deep copy fraction matrix for step storage
      const stepFractionMatrix: FractionMatrix = {}
      Object.keys(fractionMatrix).forEach(row => {
        stepFractionMatrix[row] = {}
        Object.keys(fractionMatrix[row]).forEach(col => {
          stepFractionMatrix[row][col] = new Fraction(fractionMatrix[row][col])
        })
      })

      steps.push({
        stepNumber,
        description: `Regrouper ${species1} et ${species2} (distance minimale = ${min})`,
        matrix: JSON.parse(JSON.stringify(matrix)),
        fractionMatrix: stepFractionMatrix,
        minDistance: min,
        clusteredSpecies: [species1, species2],
        newCluster: newClusterName,
        calculations
      })

      // Create new fraction matrix and regular matrix
      const newFractionMatrix: FractionMatrix = {}
      const newMatrix: DistanceMatrix = {}
      const allSpecies = [newClusterName, ...remainingSpecies]
      
      allSpecies.forEach(s => {
        newMatrix[s] = {}
        newFractionMatrix[s] = {}
      })

      for (const species of remainingSpecies) {
        const size1 = new Fraction(clusterSizes[species1] || 1)
        const size2 = new Fraction(clusterSizes[species2] || 1)
        const dist1 = fractionMatrix[species1][species]
        const dist2 = fractionMatrix[species2][species]
        
        // Calculate new distance using exact fractions
        const numerator = dist1.mul(size1).add(dist2.mul(size2))
        const denominator = size1.add(size2)
        const newFractionDistance = numerator.div(denominator)
        const newDecimalDistance = parseFloat(newFractionDistance.valueOf().toFixed(10))
        
        newFractionMatrix[newClusterName][species] = newFractionDistance
        newFractionMatrix[species][newClusterName] = newFractionDistance
        newMatrix[newClusterName][species] = newDecimalDistance
        newMatrix[species][newClusterName] = newDecimalDistance
      }

      // Copy existing distances
      for (let i = 0; i < remainingSpecies.length; i++) {
        for (let j = i; j < remainingSpecies.length; j++) {
          const s1 = remainingSpecies[i], s2 = remainingSpecies[j]
          newMatrix[s1][s2] = matrix[s1][s2]
          newMatrix[s2][s1] = matrix[s2][s1]
          newFractionMatrix[s1][s2] = fractionMatrix[s1][s2]
          newFractionMatrix[s2][s1] = fractionMatrix[s2][s1]
        }
      }
      
      newMatrix[newClusterName][newClusterName] = 0
      newFractionMatrix[newClusterName][newClusterName] = new Fraction(0)
      
      matrix = newMatrix
      fractionMatrix = newFractionMatrix

      delete clusters[species1]
      delete clusters[species2]
      clusters[newClusterName] = newCluster

      clusterSizes[newClusterName] = (clusterSizes[species1] || 1) + (clusterSizes[species2] || 1)
      delete clusterSizes[species1]
      delete clusterSizes[species2]

      stepNumber++
    }

    const finalCluster = Object.values(clusters)[0]
    return { steps, tree: finalCluster }
  }

  const analyzeSequences = () => {
    try {
      setError('')
      
      const validSequences = sequences.filter(seq => seq.sequence.trim() !== '')
      if (validSequences.length < 2) {
        throw new Error('At least 2 sequences are required')
      }

      const matrix = createDistanceMatrixFromSequences(validSequences)
      const { steps, tree } = performUPGMA(matrix)
      setResult({ steps, tree, distances: matrix })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const analyzeMatrix = () => {
    try {
      setError('')
      
      if (matrixData.length < 2) {
        throw new Error('Matrix must have at least 2 species')
      }

      const matrix = convertNumberMatrixToDistanceMatrix(matrixData)
      const { steps, tree } = performUPGMA(matrix)
      setResult({ steps, tree })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const addSequence = () => {
    const newId = (sequences.length + 1).toString()
    setSequences([...sequences, { id: newId, sequence: '' }])
  }

  const removeSequence = (id: string) => {
    if (sequences.length > 2) {
      setSequences(sequences.filter(seq => seq.id !== id))
    }
  }

  const updateSequence = (id: string, value: string) => {
    // Filter out non-DNA characters and spaces in real-time
    const filteredValue = value.replace(/[^ACTG]/gi, '').toUpperCase()
    setSequences(sequences.map(seq => 
      seq.id === id ? { ...seq, sequence: filteredValue } : seq
    ))
  }

  const loadExample1 = () => {
    const exampleSequences: DNASequence[] = [
      { id: '1', sequence: 'GTATAGGGGATATACTGAGAGCTATTACA' },
      { id: '2', sequence: 'GTATTGGCGATATTCCGAGACCTATTACT' },
      { id: '3', sequence: 'CTATTGGCCATATTCCGAGACCTATTACT' },
      { id: '4', sequence: 'GTATAGCCGATACCCGAGACCTAATTACT' }
    ]
    setSequences(exampleSequences)
  }

  const renderMatrix = (matrix: DistanceMatrix | FractionMatrix, highlightPair?: string[]) => {
    const species = Object.keys(matrix).sort()
    
    const formatValue = (row: string, col: string): string => {
      const cell = matrix[row][col]
      if (typeof cell === 'number') {
        // Regular DistanceMatrix
        if (cell === 0) return '0'
        if (Number.isInteger(cell)) return cell.toString()
        const simplified = formatFraction(Math.round(cell * 100), 100)
        if (simplified.includes('/') && simplified.length <= 5) {
          return simplified
        }
        return cell.toFixed(2)
      } else {
        // FractionMatrix (Fraction object)
        return cell.toFraction()
      }
    }
    
    return (
      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-xs font-medium"></th>
                {species.map(s => (
                  <th key={s} className="border border-gray-200 p-2 bg-gray-50 text-xs font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {species.map(row => (
                <tr key={row}>
                  <td className="border border-gray-200 p-2 bg-gray-50 font-medium text-xs">{row}</td>
                  {species.map(col => {
                    const isHighlighted = highlightPair && 
                      ((highlightPair[0] === row && highlightPair[1] === col) ||
                       (highlightPair[1] === row && highlightPair[0] === col))
                    
                    const rowIndex = species.indexOf(row)
                    const colIndex = species.indexOf(col)
                    
                    if (rowIndex > colIndex) {
                      return (
                        <td key={col} className="border border-gray-200 p-2 text-center text-xs bg-gray-50">
                          -
                        </td>
                      )
                    }
                    
                    return (
                      <td key={col} className={`border border-gray-200 p-2 text-center text-xs ${
                        isHighlighted ? 'bg-red-200 font-bold' : 
                        rowIndex === colIndex ? 'bg-gray-100' : ''
                      }`}>
                        {matrix[row][col] !== undefined ? formatValue(row, col) : '-'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {highlightPair && (
          <div className="text-sm text-red-600 font-bold mt-2 p-2 bg-red-50 rounded">
            Distance minimale: {formatValue(highlightPair[0], highlightPair[1])} entre {highlightPair[0]} et {highlightPair[1]}
            → On regroupe ces deux espèces
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          UPGMA Phylogenetic Tree Constructor
        </CardTitle>
        <CardDescription>
          Construct phylogenetic trees using the UPGMA (Unweighted Pair Group Method with Arithmetic Mean) method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            UPGMA constructs phylogenetic trees by iteratively clustering the closest species/groups based on average distances.
            You can input either DNA sequences (for automatic distance calculation) or a distance matrix directly.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="sequences" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sequences">From DNA Sequences</TabsTrigger>
            <TabsTrigger value="matrix">From Distance Matrix</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sequences" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">DNA Sequences</Label>
              <div className="flex gap-2">
                <Button onClick={loadExample1} variant="outline" size="sm">
                  Load Example
                </Button>
                <Button onClick={addSequence} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sequence
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {sequences.map((seq, index) => (
                <div key={seq.id} className="flex items-center gap-2">
                  <Label className="text-sm font-medium min-w-fit">
                    Seq {index + 1}:
                  </Label>
                  <Textarea
                    value={seq.sequence}
                    onChange={(e) => updateSequence(seq.id, e.target.value)}
                    placeholder="Enter DNA sequence (only A, C, T, G - no spaces)"
                    rows={1}
                    className="font-mono text-sm flex-1"
                  />
                  {sequences.length > 2 && (
                    <Button
                      onClick={() => removeSequence(seq.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button onClick={analyzeSequences} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Construct Tree from Sequences
            </Button>
          </TabsContent>
          
          <TabsContent value="matrix" className="space-y-4">
            <DynamicTable 
              onMatrixChange={setMatrixData}
              initialSize={4}
            />
            <Button onClick={analyzeMatrix} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Construct Tree from Matrix
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-8">
            {/* Initial Distance Matrix */}
            {result.distances && (
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Initial Distance Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Matrice des distances calculée à partir des séquences</h4>
                    {renderMatrix(createFractionMatrix(result.distances))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UPGMA Clustering Steps */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Étapes de regroupement UPGMA
                </CardTitle>
                <CardDescription>
                  Processus étape par étape montrant les calculs de fractions pour construire l'arbre phylogénétique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {result.steps.map((step, index) => (
                  <div key={index} className="space-y-4">
                    {/* Step Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-300">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-white text-blue-700 border-blue-400 text-lg px-3 py-1">
                          Étape {step.stepNumber}
                        </Badge>
                        <div className="text-lg font-bold text-gray-900">
                          Distance minimale = <span className="text-red-600">{formatFraction(Math.round(step.minDistance * 100), 100)}</span>
                        </div>
                      </div>
                      <div className="text-base font-semibold text-blue-800">
                        → On regroupe <span className="bg-yellow-200 px-2 py-1 rounded">{step.clusteredSpecies[0]}</span> et <span className="bg-yellow-200 px-2 py-1 rounded">{step.clusteredSpecies[1]}</span> en <span className="bg-green-200 px-2 py-1 rounded">{step.newCluster}</span>
                      </div>
                    </div>

                    {/* Matrix for this step */}
                    <div className="pl-6 border-l-4 border-green-200 space-y-4">
                                              <div>
                          <h5 className="font-medium text-gray-900 mb-2">Matrice des distances (Étape {step.stepNumber})</h5>
                          {renderMatrix(step.fractionMatrix || step.matrix, step.clusteredSpecies)}
                        </div>

                      {/* Fraction Calculations */}
                      {step.calculations && Object.keys(step.calculations).length > 0 && (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <h5 className="font-semibold text-amber-800 mb-3">
                            Calculs des nouvelles distances
                          </h5>
                          <div className="space-y-3">
                            {Object.values(step.calculations).map((calc, calcIndex) => (
                              <div key={calcIndex} className="bg-white rounded p-3 border">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 mb-1">
                                    d({step.newCluster}, {calc.species}) = {calc.calculation}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-blue-600">{calc.result}</span>
                                    <span className="text-gray-500 ml-2">= {calc.decimal.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  
                   
                  </div>
                ))}

              </CardContent>
            </Card>

            {/* Final Phylogenetic Tree */}
            {result.tree && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-purple-600" />
                    Arbre Phylogénétique Final
                  </CardTitle>
                  <CardDescription>
                    Représentation graphique des relations évolutives obtenues par UPGMA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border rounded-lg p-4">
                    <TreeVisualization tree={result.tree} />
                  </div>
                  
                  {/* Interpretation Guide */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3">Interprétation de l'arbre</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Axe vertical:</strong> Temps évolutif (passé → présent)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Points de branchement:</strong> Ancêtres communs</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Longueurs des branches:</strong> Distances évolutives</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span><strong>Arbre ultrametrique:</strong> Toutes les feuilles au même niveau</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 