/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <IntersectionObserver @intersect="onIntersect">
        <Grid
            :columns="columnsWithAttachColumn"
            :data-count="filtered"
            :drafts="drafts"
            :pagination="pagination"
            :filters="filterValues"
            :rows="rowsWithAttachValues"
            :collection-cell-binding="collectionCellBinding"
            :extended-components="extendedGridComponents"
            :is-editable="isAllowedToUpdate"
            :is-prefetching-data="isPrefetchingData"
            :is-basic-filter="true"
            :is-header-visible="true"
            :is-collection-layout="true"
            @edit-row="onEditRow"
            @preview-row="onEditRow"
            @cell-value="onCellValueChange"
            @delete-row="onRemoveRow"
            @pagination="onPaginationChange"
            @sort-column="onColumnSortChange"
            @remove-all-filters="onRemoveAllFilters"
            @filter="onFilterChange"
            v-bind="extendedProps['grid']">
            <template #noDataPlaceholder>
                <GridNoDataPlaceholder
                    :title="$t('media.grid.placeholderTitle')"
                    :subtitle="$t('media.grid.placeholderSubtitle')" />
            </template>
            <template #appendFooter>
                <Button
                    title="SAVE MEDIA"
                    :size="smallSize"
                    @click.native="onSaveMedia" />
            </template>
        </Grid>
    </IntersectionObserver>
</template>

<script>
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    DEFAULT_GRID_FETCH_PARAMS,
    DEFAULT_GRID_PAGINATION,
} from '@Core/defaults/grid';
import {
    FILTER_OPERATOR,
} from '@Core/defaults/operators';
import {
    SIZE,
} from '@Core/defaults/theme';
import extendPropsMixin from '@Core/mixins/extend/extendProps';
import extendedGridComponentsMixin from '@Core/mixins/grid/extendedGridComponentsMixin';
import gridDraftMixin from '@Core/mixins/grid/gridDraftMixin';
import {
    getParsedFilters,
} from '@Core/models/mappers/gridDataMapper';
import {
    getGridData,
} from '@Core/services/grid/getGridData.service';
import PRIVILEGES from '@Media/config/privileges';
import {
    ROUTE_NAME,
} from '@Media/config/routes';
import {
    MEDIA_TYPE,
} from '@Media/defaults';
import {
    GRAPHITE,
    GREEN,
} from '@UI/assets/scss/_js-variables/colors.scss';
import Button from '@UI/components/Button/Button';
import Grid from '@UI/components/Grid/Grid';
import GridNoDataPlaceholder from '@UI/components/Grid/GridNoDataPlaceholder';
import IntersectionObserver from '@UI/components/Observers/IntersectionObserver';
import {
    debounce,
} from 'debounce';

export default {
    name: 'AddMediaGrid',
    components: {
        Grid,
        GridNoDataPlaceholder,
        Button,
        IntersectionObserver,
    },
    mixins: [
        extendPropsMixin({
            extendedKey: '@Media/components/Grids/AddMediaGrid/props',
            extendedNames: [
                'grid',
            ],
        }),
        gridDraftMixin,
        extendedGridComponentsMixin,
    ],
    props: {
        multiple: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: MEDIA_TYPE.IMAGE,
        },
        value: {
            type: [
                String,
                Array,
            ],
            default: '',
        },
    },
    data() {
        return {
            searchValue: null,
            isSearchFocused: false,
            isPrefetchingData: true,
            filterValues: {},
            rows: [],
            columns: [],
            filtered: 0,
            localParams: DEFAULT_GRID_FETCH_PARAMS(),
            pagination: DEFAULT_GRID_PAGINATION(),
        };
    },
    computed: {
        isAllowedToUpdate() {
            return this.$hasAccess([
                PRIVILEGES.MULTIMEDIA.update,
            ]);
        },
        smallSize() {
            return SIZE.SMALL;
        },
        searchIconFillColor() {
            return this.isSearchFocused
                ? GREEN
                : GRAPHITE;
        },
        collectionCellBinding() {
            return {
                imageColumn: 'image',
                descriptionColumn: 'name',
                type: 'MEDIA_ATTACH',
                additionalColumns: [
                    'esa_attached',
                ],
            };
        },
        columnsWithAttachColumn() {
            if (!this.columns.length) {
                return [];
            }

            const columns = [];

            for (let i = 0; i < this.columns.length; i += 1) {
                if (this.columns[i].id !== 'type') {
                    if (i === 3) {
                        columns.push({
                            id: 'esa_attached',
                            type: 'BOOL',
                            label: 'Attached',
                            visible: true,
                            editable: true,
                            deletable: false,
                            parameters: [],
                        });
                    } else {
                        columns.push(this.columns[i]);
                    }
                }
            }

            return columns;
        },
        rowsWithAttachValues() {
            const rows = [
                ...this.rows,
            ];

            for (let i = 0; i < this.rows.length; i += 1) {
                rows[i].esa_attached = {
                    value:
                        Array.isArray(this.value)
                            ? this.value.some(id => id === this.rows[i].id.value)
                            : this.value === this.rows[i].id.value,
                };
            }

            return rows;
        },
    },
    created() {
        this.onDebounceSearch = debounce(this.onSearch, 500);
    },
    beforeDestroy() {
        delete this.onDebounceSearch;
    },
    methods: {
        async onIntersect(isIntersecting) {
            if (isIntersecting) {
                this.isPrefetchingData = true;

                await this.onFetchData();

                this.isPrefetchingData = false;
            }
        },
        onPaginationChange(pagination) {
            this.pagination = pagination;
            this.localParams.limit = pagination.itemsPerPage;
            this.localParams.offset = (pagination.page - 1) * pagination.itemsPerPage;

            this.onFetchData();
        },
        onFilterChange(filters) {
            this.filterValues = filters;
            this.pagination.page = 1;
            this.localParams.filter = getParsedFilters(filters);
            this.localParams.offset = (this.pagination.page - 1) * this.pagination.itemsPerPage;

            this.onFetchData();
        },
        onRemoveAllFilters() {
            this.filterValues = {};
            this.pagination.page = 1;
            this.localParams.filter = '';
            this.localParams.offset = 0;

            this.onFetchData();
        },
        onColumnSortChange(sortOrder) {
            this.localParams.sortOrder = sortOrder;

            this.onFetchData();
        },
        async onFetchData() {
            const {
                offset,
                limit,
                filter,
                sortOrder,
            } = this.localParams;

            const params = {
                offset,
                limit,
                extended: true,
                filter: [
                    filter,
                    `type=${FILTER_OPERATOR.EQUAL}${this.type}`,
                ].join(';'),
            };

            if (Object.keys(sortOrder).length) {
                const {
                    index: colSortID, orderState,
                } = sortOrder;

                params.field = colSortID;
                params.order = orderState;
            }

            await getGridData({
                $route: this.$route,
                $cookies: this.$cookies,
                $axios: this.$axios,
                path: 'multimedia',
                params,
                onSuccess: this.onFetchDataSuccess,
                onError: this.onFetchDataError,
            });
        },
        onFetchDataSuccess({
            columns,
            rows,
            filtered,
        }) {
            this.columns = columns;
            this.rows = rows;
            this.filtered = filtered;
        },
        onFetchDataError() {
            this.$addAlert({
                type: ALERT_TYPE.ERROR,
                message: 'Grid data haven’t been fetched properly',
            });
        },
        onRemoveRow() {
            this.$addAlert({
                type: ALERT_TYPE.SUCCESS,
                message: 'Resource removed',
            });
            this.onFetchData();
        },
        onCellValueChange(cellValues) {
            const drafts = this.multiple
                ? {
                    ...this.drafts,
                }
                : {};

            cellValues.forEach(({
                rowId,
                columnId,
                value,
            }) => {
                if (!this.multiple && this.value) {
                    drafts[`${this.value}/${columnId}`] = false;
                }

                drafts[`${rowId}/${columnId}`] = value;
            });

            this.setDrafts(drafts);
        },
        onSaveMedia() {
            const value = [];
            const toRemove = [];

            Object.keys(this.drafts).forEach((key) => {
                const [
                    rowId,
                ] = key.split('/');

                if (this.drafts[key]) {
                    value.push(rowId);
                } else {
                    toRemove.push(rowId);
                }

                const row = this.rows.find(({
                    id,
                }) => id.value === rowId);

                if (row) {
                    row.esa_attached.value = this.drafts[key];
                }
            });

            this.setDrafts();

            if (value.length || toRemove.length) {
                if (this.multiple) {
                    const mappedValue = [
                        ...this.value.filter(id => !toRemove.some(removeId => removeId === id)),
                        ...value,
                    ];

                    this.$emit('input', mappedValue);
                } else if (value.length) {
                    this.$emit('input', value.join(''));
                }

                this.$addAlert({
                    type: ALERT_TYPE.SUCCESS,
                    message: 'Resources have been updated',
                });
            } else {
                this.$addAlert({
                    type: ALERT_TYPE.INFO,
                    message: 'No changes have been made',
                });
            }
        },
        onSearchFocus(isFocused) {
            this.isSearchFocused = isFocused;
        },
        onSearch(value) {
            this.searchValue = value;
        },
        onEditRow(args) {
            const lastIndex = args.length - 1;

            this.$router.push({
                name: ROUTE_NAME.MEDIA_RESOURCE_EDIT_GENERAL,
                params: {
                    id: args[lastIndex],
                },
            });
        },
    },
};
</script>
