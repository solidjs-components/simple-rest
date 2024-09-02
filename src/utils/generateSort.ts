import type { CrudSorting } from '@solidjs-components/refine'

export function generateSort(sorters?: CrudSorting) {
    if (sorters && sorters.length > 0) {
        const _sort: string[] = []
        const _order: string[] = []

        sorters.forEach((item) => {
            _sort.push(item.field)
            _order.push(item.order)
        })

        return {
            _sort,
            _order,
        }
    }
}
