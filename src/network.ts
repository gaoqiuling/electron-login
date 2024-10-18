import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus'; // 确保引入你的消息提示库

interface RequestParams {
    url: string;
    data?: any; // 可以根据需求定义更严格的类型
    headers?: Record<string, string>;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

export const request = (method: 'get' | 'post') => ({
    url,
    data,
    headers = {},
    onUploadProgress,
}: RequestParams): Promise<any> => {
    const config: AxiosRequestConfig = {
        timeout: 30000,
        method,
        url,
        data,
        headers,
        onUploadProgress,
        withCredentials: false
    };

    return axios(config)
        .then((res: AxiosResponse) => {
            if (res.status === 200) {
                if (res.data.code != 200) {
                    console.log(res);
                    ElMessage.error(res.data.msg);
                    throw new Error(res.data.msg);
                }
                return res.data;
            }
            throw res.data;
        })
        .catch((err) => {
            console.log(err);
            if (err.message === 'Network Error') {
                ElMessage.error('网络异常，请稍后重试');
                throw new Error('请求失败，请稍后重试');
            }
            if (err.message.includes('timeout') || err.code === 'ECONNABORTED') {
                ElMessage.error('请求超时，请稍后重试');
                throw new Error('请求超时，请稍后重试');
            }
            console.log(err);
            throw err;
        });
};

export const get = request('get')
export const post = request('post')