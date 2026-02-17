export declare class LivekitController {
    getToken(room: string, username: string): Promise<{
        token: string;
        url: string;
    }>;
}
