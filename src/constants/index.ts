export const IS_DEVELOPER_ENVIRONMENT = process.env.NODE_ENV !== 'production'
export const IS_PRODUCTION_ENVIRONMENT = !IS_DEVELOPER_ENVIRONMENT
