import { PresignedUrlTypeLabel } from 'src/asset/labels/common';

export const presignedUrlFilePath = (type: PresignedUrlTypeLabel) => {
    switch (type) {
        case PresignedUrlTypeLabel.userProfile:
            return 'userProfile/origin/';
        case PresignedUrlTypeLabel.recipePostThumbnail:
            return 'recipePost/thumb/origin/';
        case PresignedUrlTypeLabel.recipePostContent:
            return 'recipePost/content/';
        case PresignedUrlTypeLabel.foodPostImage:
            return 'foodPost/origin/';
        default:
            '';
    }
};
