/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <div class="horizontal-tab-bar">
        <div class="horizontal-tab-bar__items">
            <template v-for="(item, index) in items">
                <slot
                    name="item"
                    :index="index"
                    :item="item">
                    <HorizontalTabBarItem
                        :key="index"
                        :index="index"
                        :item="item"
                        @select="onSelectTabBarItem" />
                </slot>
            </template>
            <slot name="appendItems" />
        </div>
        <TabBarItemSlider :selected-index="selectedTabIndex" />
        <slot
            name="content"
            v-if="items.length"
            :item="items[selectedTabIndex].content">
            <HorizontalTabBarContent v-bind="{ ...items[selectedTabIndex].content }" />
        </slot>
    </div>
</template>

<script>
import HorizontalTabBarContent from '@UI/components/TabBar/HorizontalTabBarContent';
import HorizontalTabBarItem from '@UI/components/TabBar/HorizontalTabBarItem';
import TabBarItemSlider from '@UI/components/TabBar/TabBarItemSlider';

export default {
    name: 'HorizontalTabBar',
    components: {
        TabBarItemSlider,
        HorizontalTabBarContent,
        HorizontalTabBarItem,
    },
    props: {
        /**
         * List of items
         */
        items: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            selectedTabIndex: 0,
        };
    },
    methods: {
        onSelectTabBarItem(index) {
            this.selectedTabIndex = index;
        },
    },
};
</script>

<style lang="scss" scoped>
    .horizontal-tab-bar {
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: column;

        &__items {
            position: relative;
            display: flex;
            height: 40px;
            flex-shrink: 0;
            background-image: linear-gradient($WHITESMOKE, $WHITE);
            overflow: auto;
            border-bottom: $BORDER_1_GREY;
        }
    }
</style>
