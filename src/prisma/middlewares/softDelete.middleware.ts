export function SoftDeleteMiddlware(params: any, next: any, Prisma: any): Promise<any> {
    if (
        params.model &&
        Prisma[`${params.model.charAt(0).toUpperCase() + params.model.slice(1)}ScalarFieldEnum`]['deletedAt']
    ) {
        switch (params.action) {
            case 'findUnique':
                params.action = 'findFirst';
                params.args.where['deletedAt'] = null;
                break;

            case 'findMany':
            case 'findFirst':
                if (params.model === 'recipePostComment') {
                    break;
                }
                if (params.args.where !== undefined) {
                    if (params.args.where.deletedAt === undefined) {
                        if (params.args.where['NOT']['deletedAt'] === null) {
                            break;
                        }
                        params.args.where['deletedAt'] = null;
                    }
                } else {
                    params.args['where'] = { deletedAt: null };
                }
                break;

            case 'update':
                break;

            case 'updateMany':
                if (params.args.where !== undefined) {
                    params.args.where['deletedAt'] = null;
                } else {
                    params.args['where'] = { deletedAt: null };
                }
                break;
        }
    }

    return next(params);
}
