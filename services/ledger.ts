import { Toast } from 'antd-mobile';

export interface InviteCodeResponse {
    code: string;
    expireAt: string;
}

// Mock API: Create Invite Code
export const createInviteCode = async (ledgerId: string): Promise<InviteCodeResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: "888888",
                expireAt: "2025-12-31"
            });
        }, 500);
    });
};

// Mock API: Join Ledger
export const joinLedger = async (code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (code === "888888") {
                resolve();
            } else {
                reject(new Error("无效的邀请码"));
            }
        }, 500);
    });
};
