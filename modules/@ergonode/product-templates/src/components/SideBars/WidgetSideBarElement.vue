/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ListDraggableElement
        :disabled="disabled"
        :draggable-id="item.type"
        :label="item.label"
        @drag="onDrag">
        <ListElementIcon>
            <IconFontSize />
        </ListElementIcon>
        <ListElementDescription>
            <ListElementTitle :title="item.label" />
            <ListElementHint :title="item.code" />
        </ListElementDescription>
    </ListDraggableElement>
</template>

<script>
import IconFontSize from '@UI/components/Icons/Editor/IconFontSize';
import ListDraggableElement from '@UI/components/List/ListDraggableElement';
import ListElementDescription from '@UI/components/List/ListElementDescription';
import ListElementHint from '@UI/components/List/ListElementHint';
import ListElementIcon from '@UI/components/List/ListElementIcon';
import ListElementTitle from '@UI/components/List/ListElementTitle';
import {
    mapActions,
} from 'vuex';

export default {
    name: 'WidgetSideBarElement',
    components: {
        ListElementDescription,
        ListElementTitle,
        ListDraggableElement,
        ListElementIcon,
        ListElementHint,
        IconFontSize,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        ...mapActions('draggable', [
            '__setState',
        ]),
        onDrag(isDragged) {
            this.__setState({
                key: 'draggedElement',
                value: isDragged
                    ? this.item.type
                    : null,
            });
        },
    },
};
</script>
