/**
 * SMC 3.0 客户端模块
 * 封装华为 SMC 3.0 视频会议系统的终端地址本查询接口
 */
/**
 * 网络错误异常
 * 当发生网络连接问题、超时等情况时抛出
 */
export class NetworkError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
/**
 * 业务错误异常
 * 当 SMC 接口返回业务错误时抛出
 */
export class BusinessError extends Error {
    constructor(message, code, response) {
        super(message);
        this.code = code;
        this.response = response;
        this.name = 'BusinessError';
        Object.setPrototypeOf(this, BusinessError.prototype);
    }
}
/**
 * SMC 3.0 客户端类
 */
export class SMCClient {
    /**
     * 创建 SMC 客户端实例
     * @param options - 客户端配置选项，包含 baseUrl、username 和 password
     */
    constructor(options) {
        if (!options.baseUrl) {
            throw new Error('baseUrl is required');
        }
        if (!options.username) {
            throw new Error('username is required');
        }
        if (!options.password) {
            throw new Error('password is required');
        }
        // 移除末尾的斜杠，确保 URL 拼接正确
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.username = options.username;
        this.password = options.password;
    }
    /**
     * 获取认证请求头
     * @returns 包含 Basic 认证信息的请求头对象
     */
    getAuthHeaders() {
        const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    /**
     * 处理 HTTP 响应
     * @param response - fetch 返回的 Response 对象
     * @returns 解析后的 JSON 数据
     * @throws BusinessError 当响应状态码表示业务错误时
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorCode = String(response.status);
            let errorData;
            try {
                errorData = await response.json();
                if (errorData && typeof errorData === 'object') {
                    const data = errorData;
                    if (typeof data.message === 'string') {
                        errorMessage = data.message;
                    }
                    if (typeof data.code === 'string') {
                        errorCode = data.code;
                    }
                }
            }
            catch {
                // 如果无法解析 JSON，使用默认错误信息
            }
            throw new BusinessError(errorMessage, errorCode, errorData);
        }
        return response.json();
    }
    /**
     * 发送 HTTP 请求
     * @param path - API 路径
     * @param options - fetch 选项
     * @returns 解析后的响应数据
     * @throws NetworkError 当发生网络错误时
     * @throws BusinessError 当发生业务错误时
     */
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            ...this.getAuthHeaders(),
            ...(options.headers || {})
        };
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            // 如果是业务错误，直接抛出
            if (error instanceof BusinessError) {
                throw error;
            }
            // 网络错误包装为 NetworkError
            if (error instanceof Error) {
                throw new NetworkError(`Network request failed: ${error.message}`, error);
            }
            throw new NetworkError('Unknown network error occurred');
        }
    }
    /**
     * 查询终端地址本
     * @param keyword - 可选的搜索关键词，用于过滤终端名称或 IP
     * @returns 终端列表
     * @throws NetworkError 当发生网络错误时
     * @throws BusinessError 当发生业务错误时
     */
    async queryAddressBook(keyword) {
        // 构建查询参数
        const params = new URLSearchParams();
        if (keyword) {
            params.append('keyword', keyword);
        }
        const queryString = params.toString();
        const path = `/api/v1/addressbook/terminals${queryString ? `?${queryString}` : ''}`;
        // 调用 SMC 3.0 接口
        const response = await this.request(path, {
            method: 'GET'
        });
        // 转换响应数据为 Terminal 数组
        return this.transformTerminals(response);
    }
    /**
     * 将 SMC 响应数据转换为 Terminal 数组
     * @param response - SMC 接口返回的数据
     * @returns Terminal 数组
     */
    transformTerminals(response) {
        if (!response || !Array.isArray(response.terminals)) {
            return [];
        }
        return response.terminals.map((item) => ({
            id: String(item.id || ''),
            name: String(item.name || ''),
            ip: String(item.ip || ''),
            status: String(item.status || '')
        }));
    }
}
export default SMCClient;
//# sourceMappingURL=smc-client.js.map