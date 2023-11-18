import * as d3 from 'd3'
import { Margin } from './Interfaces'

export const colourSchemeCategorical = d3.schemeTableau10
export const colourSchemeSequential = d3.schemeBlues[9]

export const margin: Margin = {
    left: 16,
    right: 16,
    top: 16,
    bottom: 20
}

export const barPadding = 0.2