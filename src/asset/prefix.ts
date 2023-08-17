export const redisPrefix = {
    recipePostViewCount: (id: number) => `recipePostViewCnt:${id}`,
    foodPostViewCount: (id: number) => `foodPostViewCnt:${id}`,
};
