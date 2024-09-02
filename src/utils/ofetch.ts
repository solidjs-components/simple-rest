import { ofetch } from 'ofetch'
import type { HttpError } from '@solidjs-components/refine'

const instance = ofetch.create({
    onRequest(context) {
        const token = localStorage.getItem('authorization')
        const locale = localStorage.getItem('privtorr-locale') || 'en'

        context.options.headers = {
            ...(context.options.headers || {}),
            ...token ? { Authorization: token } : {},
            'x-language': locale,
        }

        console.log(context.options.headers)
    },
    onResponseError(context) {
        const data = context.response._data

        const customError: HttpError = {
            message: data?.message,
            statusCode: data?.code,
        }

        return Promise.reject(customError)
    },
})

export { instance }
