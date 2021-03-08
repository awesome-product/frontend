/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
export function paramsSerializer(paramsToSerialize) {
    if (!paramsToSerialize.ids) {
        return 'filter=all';
    }

    const {
        ids: {
            list = [],
            included = false,
        },
    } = paramsToSerialize;

    const filters = [];

    list.forEach((id) => {
        filters.push(`filter[ids][list][]=${id}`);
    });

    filters.push(`filter[ids][included]=${included}`);

    return filters.join('&');
}