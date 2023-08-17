export const redisPrefix = {
    recipePostViewCount: (id: number) => `recipePostViewCnt:${id}`,
    alreadyViewedRecipe: (id: number, ip: string | undefined) => `recipePostViewed:${id}-${ip}`,
    foodPostViewCount: (id: number) => `foodPostViewCnt:${id}`,
    alreadyViewedFood: (id: number, ip: string | undefined) => `foodPostViewed:${id}-${ip}`,
};
