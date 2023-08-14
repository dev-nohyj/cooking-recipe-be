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
    RECIPE_POST_MAX_TAG: {
        code: 201,
        customError: 'RECIPE_POST_MAX_TAG',
        clientMsg: '태그 최대 갯수를 초과했습니다.',
    },
    CREATE_RECIPE_POST_FAILURE: {
        code: 202,
        customError: 'CREATE_RECIPE_POST_FAILURE',
        clientMsg: '게시물 작성에 실패했습니다.',
    },
    DELETE_RECIPE_POST_FAILURE: {
        code: 203,
        customError: 'DELETE_RECIPE_POST_FAILURE',
        clientMsg: '게시물 삭제에 실패했습니다.',
    },
    NO_EXISTING_RECIPE_POST: {
        code: 204,
        customError: 'NO_EXISTING_RECIPE_POST',
        clientMsg: '게시물이 존재하지 않습니다.',
    },
    MODIFY_RECIPE_POST_FAILURE: {
        code: 205,
        customError: 'MODIFY_RECIPE_POST_FAILURE',
        clientMsg: '게시물이 수정에 실패했습니다.',
    },
    GET_COMMENT_FAILURE: {
        code: 206,
        customError: 'GET_COMMENT_FAILURE',
        clientMsg: '댓글 조회에 실패했습니다.',
    },
    CREATE_COMMENT_FAILURE: {
        code: 206,
        customError: 'CREATE_COMMENT_FAILURE',
        clientMsg: '댓글 생성에 실패했습니다.',
    },
    MODIFY_COMMENT_FAILURE: {
        code: 206,
        customError: 'MODIFY_COMMENT_FAILURE',
        clientMsg: '댓글 수정에 실패했습니다.',
    },
    DELETE_COMMENT_FAILURE: {
        code: 206,
        customError: 'DELETE_COMMENT_FAILURE',
        clientMsg: '댓글 삭제에 실패했습니다.',
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
