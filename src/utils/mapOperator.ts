import type { CrudOperators } from '@solidjs-components/refine'

export function mapOperator(operator: CrudOperators): string {
    switch (operator) {
        case 'ne':
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
            return `[${operator}]`
        case 'contains':
            return `[match]`
        default:
            return ''
    }
}
