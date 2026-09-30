import React from 'react'
import { ColSpan } from '@/app/aux/Interfaces'

interface DashboardGridProps {
    children: React.ReactNode
    className?: string
}

interface ChartCardProps {
    children: React.ReactNode
    colSpan?: ColSpan
    className?: string
}

const xsClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
}

const smClasses: Record<number, string> = {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
    4: 'sm:col-span-4',
    5: 'sm:col-span-5',
    6: 'sm:col-span-6',
    7: 'sm:col-span-7',
    8: 'sm:col-span-8',
    9: 'sm:col-span-9',
    10: 'sm:col-span-10',
    11: 'sm:col-span-11',
    12: 'sm:col-span-12',
}

const mdClasses: Record<number, string> = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
}

const lgClasses: Record<number, string> = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
}

const xlClasses: Record<number, string> = {
    1: 'xl:col-span-1',
    2: 'xl:col-span-2',
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    5: 'xl:col-span-5',
    6: 'xl:col-span-6',
    7: 'xl:col-span-7',
    8: 'xl:col-span-8',
    9: 'xl:col-span-9',
    10: 'xl:col-span-10',
    11: 'xl:col-span-11',
    12: 'xl:col-span-12',
}

const colSpanToClasses = (colSpan?: ColSpan): string => {
    // Default to full 12 columns on mobile/xs so each chart renders on a different row
    const xs = colSpan?.xs ?? 12
    const sm = colSpan?.sm
    const md = colSpan?.md
    const lg = colSpan?.lg
    const xl = colSpan?.xl

    const classes: string[] = [xsClasses[xs] || 'col-span-12']

    if (sm && smClasses[sm]) {
        classes.push(smClasses[sm])
    }
    if (md && mdClasses[md]) {
        classes.push(mdClasses[md])
    }
    if (lg && lgClasses[lg]) {
        classes.push(lgClasses[lg])
    }
    if (xl && xlClasses[xl]) {
        classes.push(xlClasses[xl])
    }

    return classes.join(' ')
}

export const DashboardGrid = ({ children, className = '' }: DashboardGridProps) => {
    return (
        <div className={`grid grid-cols-12 gap-4 sm:gap-6 w-full ${className}`}>
            {children}
        </div>
    )
}

export const ChartCard = ({ children, colSpan, className = '' }: ChartCardProps) => {
    const colClasses = colSpanToClasses(colSpan)

    return (
        <div className={`${colClasses} bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all hover:border-neutral-700/80 w-full min-w-0 ${className}`}>
            {children}
        </div>
    )
}

export default DashboardGrid
