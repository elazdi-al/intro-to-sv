'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { TreePine, Calculator, Info, Plus, Trash2 } from 'lucide-react'
import DynamicTable from '@/components/ui/dynamic-table'

interface DistanceMatrix {
  [key: string]: { [key: string]: number }
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
  minDistance: number
  clusteredSpecies: string[]
  newCluster: string
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

  // Perform UPGMA clustering
  const performUPGMA = (initialMatrix: DistanceMatrix): { steps: Step[], tree: ClusterNode } => {
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

      steps.push({
        stepNumber,
        description: `Cluster ${species1} and ${species2} (distance = ${min})`,
        matrix: JSON.parse(JSON.stringify(matrix)),
        minDistance: min,
        clusteredSpecies: [species1, species2],
        newCluster: newClusterName
      })

      // Create new matrix
      const newMatrix: DistanceMatrix = {}
      const remainingSpecies = Object.keys(matrix).filter(s => s !== species1 && s !== species2)
      const allSpecies = [newClusterName, ...remainingSpecies]
      
      allSpecies.forEach(s => (newMatrix[s] = {}))

      for (const species of remainingSpecies) {
        const size1 = clusterSizes[species1] || 1
        const size2 = clusterSizes[species2] || 1
        const dist1 = matrix[species1][species]
        const dist2 = matrix[species2][species]
        const newDistance = (dist1 * size1 + dist2 * size2) / (size1 + size2)
        newMatrix[newClusterName][species] = newDistance
        newMatrix[species][newClusterName] = newDistance
      }

      for (let i = 0; i < remainingSpecies.length; i++) {
        for (let j = i; j < remainingSpecies.length; j++) {
          const s1 = remainingSpecies[i], s2 = remainingSpecies[j]
          newMatrix[s1][s2] = matrix[s1][s2]
          newMatrix[s2][s1] = matrix[s2][s1]
        }
      }
      newMatrix[newClusterName][newClusterName] = 0
      matrix = newMatrix

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

  const renderMatrix = (matrix: DistanceMatrix, highlightPair?: string[]) => {
    const species = Object.keys(matrix).sort()
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2 bg-gray-50"></th>
              {species.map(s => (
                <th key={s} className="border border-gray-200 p-2 bg-gray-50 text-sm">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {species.map(row => (
              <tr key={row}>
                <td className="border border-gray-200 p-2 bg-gray-50 font-medium text-sm">{row}</td>
                {species.map(col => {
                  const isHighlighted = highlightPair && 
                    ((highlightPair[0] === row && highlightPair[1] === col) ||
                     (highlightPair[1] === row && highlightPair[0] === col))
                  
                  const rowIndex = species.indexOf(row)
                  const colIndex = species.indexOf(col)
                  
                  if (rowIndex > colIndex) {
                    return (
                      <td key={col} className="border border-gray-200 p-2 text-center text-sm bg-gray-50">
                        -
                      </td>
                    )
                  }
                  
                  return (
                    <td key={col} className={`border border-gray-200 p-2 text-center text-sm ${
                      isHighlighted ? 'bg-yellow-200' : ''
                    }`}>
                      {matrix[row][col] !== undefined ? matrix[row][col] : '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
          <div className="space-y-6">
            {result.distances && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Distance Matrix</h3>
                {renderMatrix(result.distances)}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">UPGMA Clustering Steps</h3>
              <div className="space-y-4">
                {result.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Step {step.stepNumber}</Badge>
                      <span className="text-sm">{step.description}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Minimum distance: <strong>{step.minDistance}</strong>
                    </div>
                    {renderMatrix(step.matrix, step.clusteredSpecies)}
                  </Card>
                ))}
              </div>
            </div>

            {result.tree && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Phylogenetic Tree</h3>
                <div className="bg-white border rounded-lg p-4">
                  <TreeVisualization tree={result.tree} />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Tree Interpretation:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>The tree shows evolutionary relationships with time on the vertical axis</li>
                    <li>Branch points represent common ancestors</li>
                    <li>Closer species share more recent common ancestors</li>
                    <li>The tree is ultrametric (all leaves at the same distance from root)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 