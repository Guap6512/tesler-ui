import {Observable} from 'rxjs/Observable'
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'
import qs from 'query-string'
import {axiosInstance, getStoreInstance} from '../Provider'
import {ObjectMap, TeslerResponse} from '../interfaces/objectMap'
import {$do} from '../actions/actions'
import {OperationError} from '../interfaces/operation'
import {BusinessError, ApplicationErrorType} from '../interfaces/view'
import {openButtonWarningNotification} from './notifications'
import {historyObj} from '../reducers/router'

export interface ApiCallContext {
    widgetName: string
}

export const HEADERS = { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }

const createAxiosRequest = () => {
    return axiosInstance || axios.create({
        responseType: 'json',
        headers: {
            ...HEADERS
        }
    })
}

const onResponseHook = <ResponsePayload>(response: AxiosResponse<ResponsePayload>) => {
    return response
}

/**
 * TODO
 * 
 * @param value 
 */
function redirectOccurred(value: AxiosResponse<TeslerResponse>) {
    if (value.data?.redirectUrl) {
        let redirectUrl = value.data.redirectUrl
        if (!redirectUrl.startsWith('/') && !redirectUrl.match('^http(.?)://')) {
            redirectUrl = `${window.location.pathname}#/${redirectUrl}`
        }
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            redirectUrl = `${window.location.origin}${redirectUrl}`
        }
        window.location.replace(redirectUrl)
        return false
    }
    return true
}

/**
 * TODO
 * 
 * @param error 
 * @param callContext 
 */
function onErrorHook(error: AxiosError, callContext?: ApiCallContext) {
    if (error.response) {
        switch (error.response.status) {
            case 401 : {
                getStoreInstance().dispatch($do.logoutDone(null))
                historyObj.push('/')
                break
            }
            case 418 : {
                const typedError = error.response.data as OperationError
                if (typedError.error.popup) {
                    const businessError: BusinessError = {
                        type: ApplicationErrorType.BusinessError,
                        message: typedError.error.popup[0]
                    }
                    getStoreInstance().dispatch($do.showViewError({error: businessError}))
                    if (typedError.error.postActions?.[0]) {
                        const widget = getStoreInstance().getState().view.widgets.find(item => item.name === callContext.widgetName)
                        const bcName = widget?.type
                        getStoreInstance().dispatch($do.processPostInvoke({
                            bcName,
                            postInvoke: typedError.error.postActions[0],
                            widgetName: widget.name
                        }))
                    }
                }
                break
            }
            case 409 : {
                const notificationMessage = error.response.data.error?.popup?.[0] || ''
                openButtonWarningNotification(
                    notificationMessage,
                    'OK',
                    0,
                    null,
                    'action_edit_error'
                )
                break
            }
            default : {
                const businessError = {
                    type: ApplicationErrorType.BusinessError,
                    code: error.response.status,
                    details: error.response.data
                }
                getStoreInstance().dispatch($do.showViewError({error: businessError}))
            }
        }
    } else {
        const networkError = {
            type: ApplicationErrorType.NetworkError,
        }
        getStoreInstance().dispatch($do.showViewError({error: networkError}))
    }
    throw error
}

const axiosForApi = {
    get: <ResponsePayload>(path: string, config: AxiosRequestConfig, callContext?: ApiCallContext) =>
        createAxiosRequest()
        .get<ResponsePayload>(path, config).then(onResponseHook)
        .catch((reason: any) => {
            onErrorHook(reason, callContext)
        }) as Promise<AxiosResponse<ResponsePayload>> // TODO: Как работает типизация для catch-ветки?
    ,
    put: <ResponsePayload>(path: string, data: any, callContext?: ApiCallContext) =>
        createAxiosRequest()
        .put<ResponsePayload>(path, data).then(onResponseHook)
        .catch((reason: any) => {
            onErrorHook(reason, callContext)
        }) as Promise<AxiosResponse<ResponsePayload>>,
    post: <ResponsePayload>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) =>
        createAxiosRequest()
        .post(path, data, config).then(onResponseHook)
        .catch((reason: any) => {
            onErrorHook(reason, callContext)
        }) as Promise<AxiosResponse<ResponsePayload>>,
    delete: <ResponsePayload>(path: string, callContext?: ApiCallContext) =>
        createAxiosRequest()
        .delete(path).then(onResponseHook)
        .catch((reason: any) => {
            onErrorHook(reason, callContext)
        }) as Promise<AxiosResponse<ResponsePayload>>
}

/**
 * http get-запрос средствами axios в RxJs стиле. Изоморфная замена AjaxObservable.
 * @param path - путь http запроса.
 * @param headers - заголовки http запроса.
 * @param callContext - данные для обработчиков взятые из контекста вызова запроса
 * @template ResponsePayload - тип возвращаемого ответа
 */
const axiosGet = <ResponsePayload>(path: string, config: AxiosRequestConfig = {}, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.get<ResponsePayload>(path, config, callContext))
    .takeWhile(redirectOccurred)
    .map((response) => response.data)
}

/**
 * http get-запрос средствами axios в RxJs стиле. Изоморфная замена AjaxObservable.
 * @param path - путь http запроса.
 * @param headers - заголовки http запроса.
 * @param callContext - данные для обработчиков взятые из контекста вызова запроса
 * @template ResponsePayload - тип возвращаемого ответа
 */
const axiosPost = <ResponsePayload>(path: string, data: any, config: AxiosRequestConfig = {}, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.post<ResponsePayload>(path, data, config, callContext))
    .takeWhile(redirectOccurred)
    .map((response) => response.data)
}

/**
 * http get-запрос средствами axios в RxJs стиле. Изоморфная замена AjaxObservable.
 * @param path - путь http запроса.
 * @param headers - заголовки http запроса.
 * @param callContext - данные для обработчиков взятые из контекста вызова запроса
 * @template ResponsePayload - тип возвращаемого ответа
 */
const axiosPut = <ResponsePayload>(path: string, data: any, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.put<ResponsePayload>(path, data, callContext))
    .takeWhile(redirectOccurred)
    .map((response) => response.data)
}

/**
 * http get-запрос средствами axios в RxJs стиле. Изоморфная замена AjaxObservable.
 * @param path - путь http запроса.
 * @param headers - заголовки http запроса.
 * @param callContext - данные для обработчиков взятые из контекста вызова запроса
 * @template ResponsePayload - тип возвращаемого ответа
 */
const axiosDelete = <ResponsePayload>(path: string, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.delete<ResponsePayload>(path, callContext))
    .takeWhile(redirectOccurred)
    .map((response) => response.data)
}

type QueryParamsMap = ObjectMap<string | number>

/**
 * Удаляет из словаря GET-параметры, которым задано ложное значение кроме 0 (number) 
 */
function dropEmptyOrWrongParams(qso: QueryParamsMap) {
    const result: QueryParamsMap = { ...qso }

    return Object.keys(result).reduce((prev, paramKey) => {
        if (!prev[paramKey] && typeof prev[paramKey] !== 'number' ) {
            delete prev[paramKey]
        }
        return prev
    }, result)
}

/**
 * Добавляет в адрес управляющий символ для нового GET-параметра, ? или & 
 */
export function addTailControlSequences(url: string) {
    return !url.includes('?')
        ? url + '?'
        : url + '&'
}

/**
 * Добавляет в адрес GET-параметры из словаря
 */
export function applyParams(url: string, qso: QueryParamsMap) {
    if (!qso) {
        return url
    }
    return applyRawParams(url, dropEmptyOrWrongParams(qso))
}

/**
 * TODO
 * 
 * @param url 
 * @param qso 
 */
export function applyRawParams(url: string, qso: object) {
    if (!qso) {
        return url
    }
    const result = qs.stringify(qso, { encode: true })
    return `${addTailControlSequences(url)}${result && `${result}`}`
}

export {
    axiosForApi,
    axiosGet,
    axiosPut,
    axiosDelete,
    axiosPost
}
