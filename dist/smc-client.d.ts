/**
 * SMC 3.0 客户端模块
 * 封装华为 SMC 3.0 视频会议系统的终端地址本查询接口
 */
/**
 * 终端信息类型
 */
export interface Terminal {
    id: string;
    name: string;
    ip: string;
    status: string;
}
/**
 * SMC 客户端配置选项
 */
export interface SMCClientOptions {
    baseUrl: string;
    username: string;
    password: string;
}
/**
 * 网络错误异常
 * 当发生网络连接问题、超时等情况时抛出
 */
export declare class NetworkError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
/**
 * 业务错误异常
 * 当 SMC 接口返回业务错误时抛出
 */
export declare class BusinessError extends Error {
    readonly code: string;
    readonly response?: unknown | undefined;
    constructor(message: string, code: string, response?: unknown | undefined);
}
/**
 * SMC 3.0 客户端类
 */
export declare class SMCClient {
    private readonly baseUrl;
    private readonly username;
    private readonly password;
    /**
     * 创建 SMC 客户端实例
     * @param options - 客户端配置选项，包含 baseUrl、username 和 password
     */
    constructor(options: SMCClientOptions);
    /**
     * 获取认证请求头
     * @returns 包含 Basic 认证信息的请求头对象
     */
    private getAuthHeaders;
    /**
     * 处理 HTTP 响应
     * @param response - fetch 返回的 Response 对象
     * @returns 解析后的 JSON 数据
     * @throws BusinessError 当响应状态码表示业务错误时
     */
    private handleResponse;
    /**
     * 发送 HTTP 请求
     * @param path - API 路径
     * @param options - fetch 选项
     * @returns 解析后的响应数据
     * @throws NetworkError 当发生网络错误时
     * @throws BusinessError 当发生业务错误时
     */
    private request;
    /**
     * 查询终端地址本
     * @param keyword - 可选的搜索关键词，用于过滤终端名称或 IP
     * @returns 终端列表
     * @throws NetworkError 当发生网络错误时
     * @throws BusinessError 当发生业务错误时
     */
    queryAddressBook(keyword?: string): Promise<Terminal[]>;
    /**
     * 将 SMC 响应数据转换为 Terminal 数组
     * @param response - SMC 接口返回的数据
     * @returns Terminal 数组
     */
    private transformTerminals;
}
export default SMCClient;
//# sourceMappingURL=smc-client.d.ts.map