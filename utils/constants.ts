export const CATEGORY_ICONS: Record<string, { label: string; icon: string }> = {
    food: { label: '餐饮', icon: '🍔' },
    transport: { label: '交通', icon: '🚗' },
    shopping: { label: '购物', icon: '🛍️' },
    entertainment: { label: '娱乐', icon: '🎮' },
    housing: { label: '居住', icon: '🏠' },
    medical: { label: '医疗', icon: '💊' },
    salary: { label: '工资', icon: '💰' },
    bonus: { label: '奖金', icon: '🧧' },
    investment: { label: '理财', icon: '📈' },
    other: { label: '其他', icon: '📋' },
};

export const TRANSACTION_TYPES = {
    EXPENSE: 1,
    INCOME: 2,
};
