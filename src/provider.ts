import stringify from 'query-string'
import type { $Fetch } from 'ofetch'
import type { DataProvider } from '@solidjs-components/refine'
import { generateFilter, generateSort, instance } from './utils'

type MethodTypes = 'get' | 'delete' | 'head' | 'options'
type MethodTypesWithBody = 'post' | 'put' | 'patch'

export function dataProvider(apiUrl: string, httpClient: $Fetch = instance): Omit<
    Required<DataProvider>,
  'createMany' | 'updateMany' | 'deleteMany'
> {
    return {
        getList: async ({ resource, pagination, filters, sorters, meta }) => {
            const url = `${apiUrl}/${resource}`

            const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {}

            const { headers: headersFromMeta, method } = meta ?? {}
            const requestMethod = (method as MethodTypes) ?? 'get'

            const queryFilters = generateFilter(filters)

            const query: {
                _start?: number
                _end?: number
                _sort?: string
                _order?: string
            } = {}

            if (mode === 'server') {
                query._start = (current - 1) * pageSize
                query._end = current * pageSize
            }

            const generatedSort = generateSort(sorters)
            if (generatedSort) {
                const { _sort, _order } = generatedSort
                query._sort = _sort.join(',')
                query._order = _order.join(',')
            }

            const combinedQuery = { ...query, ...queryFilters }
            const urlWithQuery = Object.keys(combinedQuery).length
                ? `${url}?${stringify.stringify(combinedQuery)}`
                : url

            const { headers, _data: data } = await httpClient.raw(urlWithQuery, {
                headers: headersFromMeta,
                method: requestMethod,
            })

            const total = Number(headers.get('x-total-count') || 0)

            return {
                data,
                total: total || data.length,
            }
        },

        getMany: async ({ resource, ids, meta }) => {
            const { headers, method } = meta ?? {}
            const requestMethod = (method as MethodTypes) ?? 'get'

            const data = await httpClient(`${apiUrl}/${resource}?${stringify.stringify({ id: ids })}`, {
                method: requestMethod,
                headers,
            })

            return {
                data,
            }
        },

        create: async ({ resource, variables, meta }) => {
            const url = `${apiUrl}/${resource}`

            const { headers, method } = meta ?? {}
            const requestMethod = (method as MethodTypesWithBody) ?? 'post'

            const data = await httpClient(url, {
                method: requestMethod,
                headers,
                body: JSON.stringify(variables),
            })

            return {
                data,
            }
        },

        update: async ({ resource, id, variables, meta }) => {
            const url = `${apiUrl}/${resource}/${id}`

            const { headers, method } = meta ?? {}
            const requestMethod = (method as MethodTypesWithBody) ?? 'put'

            const data = await httpClient(url, {
                method: requestMethod,
                headers,
                body: JSON.stringify(variables),
            })

            return {
                data,
            }
        },

        getOne: async ({ resource, id, meta }) => {
            const { headers, method, preload } = meta ?? {}
            const requestMethod = (method as MethodTypes) ?? 'get'

            const query: { _preload?: string } = {}

            if (preload) {
                query._preload = preload ? preload.join(',') : ''
            }

            const url = `${apiUrl}/${resource}/${id}?${stringify.stringify(query)}`
            const data = await httpClient(url, {
                method: requestMethod,
                headers,
            })

            return {
                data,
            }
        },

        deleteOne: async ({ resource, id, variables, meta }) => {
            const url = `${apiUrl}/${resource}/${id}`

            const { headers, method } = meta ?? {}
            const requestMethod = (method as MethodTypesWithBody) ?? 'delete'

            const data = await httpClient(url, {
                method: requestMethod,
                headers,
                body: JSON.stringify(variables),
            })

            return {
                data,
            }
        },

        getApiUrl: () => {
            return apiUrl
        },

        custom: async ({
            url,
            method,
            filters,
            sorters,
            payload,
            query,
            headers,
        }) => {
            let requestUrl = url.startsWith('/') ? url : `${apiUrl}/${url}`
            let queries = ''

            if (sorters) {
                const generatedSort = generateSort(sorters)
                if (generatedSort) {
                    const { _sort, _order } = generatedSort
                    const sortQuery = {
                        _sort: _sort.join(','),
                        _order: _order.join(','),
                    }
                    queries = `${queries}&${stringify.stringify(sortQuery)}`
                }
            }

            if (filters) {
                const filterQuery = generateFilter(filters)
                queries = `${queries}&${stringify.stringify(filterQuery)}`
            }

            if (query) {
                queries = `${queries}&${stringify.stringify(query)}`
            }

            requestUrl = queries.length > 0 ? `${requestUrl}?${queries}` : requestUrl
            console.log(requestUrl)
            let resp
            switch (method) {
                case 'put':
                case 'post':
                case 'patch':
                    resp = await httpClient(requestUrl, {
                        method,
                        body: JSON.stringify(payload),
                        headers,
                    })
                    break
                case 'delete':
                    resp = await httpClient(requestUrl, {
                        method: 'delete',
                        body: JSON.stringify(payload),
                        headers,
                    })
                    break
                default:
                    resp = await httpClient(requestUrl, {
                        method: 'get',
                        headers,
                    })
                    break
            }

            return Promise.resolve({ data: resp })
        },
    }
}
