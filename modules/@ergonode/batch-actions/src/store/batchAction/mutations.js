/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
export const types = {
    ADD_BATCH_ACTION: 'ADD_BATCH_ACTION',
    REMOVE_BATCH_ACTION: 'REMOVE_BATCH_ACTION',
};

export default {
    [types.ADD_BATCH_ACTION](state, batchAction) {
        state.batchActions.push(batchAction);
    },
    [types.REMOVE_BATCH_ACTION](state, index) {
        state.batchActions.splice(index, 1);
    },
};
