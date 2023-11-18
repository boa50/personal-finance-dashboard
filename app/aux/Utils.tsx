import { Margin, SvgDims } from "./Interfaces"

interface GetDims {
    svgDims: SvgDims
    margin: Margin
}

export const getDims = ({ svgDims, margin }: GetDims) => {
    const width = svgDims.width - margin.left - margin.right
    const height = svgDims.height - margin.top - margin.bottom

    return { width, height }
}