export const customErrorLabel = {
    UNKNOWN: {
        code: 1,
        customError: 'UNKNOWN',
        clientMsg: '오류가 발생했습니다! 다시 시도해 주세요.',
    },
    INVALID_DATA_TYPE: {
        code: 101,
        customError: 'INVALID_DATA_TYPE',
        clientMsg: '올바르지 않은 데이터 형식입니다.',
    },
    DELETE_USER_FAILURE: {
        code: 111,
        customError: 'DELETE_USER_FAILURE',
        clientMsg: '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.',
    },
    MODIFY_USER_FAILURE: {
        code: 112,
        customError: 'MODIFY_USER_FAILURE',
        clientMsg: '정보 수정에 실패했습니다. 다시 시도해 주세요.',
    },
    NO_EXISTING_USER: {
        code: 113,
        customError: 'NO_EXISTING_USER',
        clientMsg: '오류가 발생했습니다! 다시 시도해 주세요.',
    },
    BAD_REQUEST: {
        code: 400,
        customError: 'BAD_REQUEST',
        clientMsg: '잘못된 요청입니다.',
    },
    NOTFOUND: {
        code: 404,
        customError: 'NOTFOUND',
        clientMsg: 'NOTFOUND',
    },
    NO_EXISTING_SESSION: {
        code: 601,
        customError: 'NO_EXISTING_SESSION',
        clientMsg: '로그인이 필요합니다. 다시 시도해 주세요.',
    },
    SYSTEM_ERROR: {
        code: 10001,
        customError: 'SYSTEM_ERROR',
        clientMsg: '시스템 에러가 발생했습니다. 다시 시도해 주세요.',
    },
    PRISMA_ERROR: {
        code: 10002,
        customError: 'PRISMA_ERROR',
        clientMsg: '시스템 에러가 발생했습니다. 다시 시도해 주세요.',
    },
    S3_ERROR: {
        code: 10003,
        customError: 'S3_ERROR',
        clientMsg: '시스템 에러가 발생했습니다. 다시 시도해 주세요.',
    },
    LOGGING_ERROR: {
        code: 10004,
        customError: 'LOGGING_ERROR',
        clientMsg: '시스템 에러가 발생했습니다. 다시 시도해 주세요.',
    },
};
