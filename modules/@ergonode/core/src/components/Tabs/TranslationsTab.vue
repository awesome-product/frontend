/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <CenterViewTemplate :fixed="true">
        <template #header>
            <div class="translation-language-select">
                <TranslationSelect
                    data-cy="translation-language-select"
                    v-model="selectedLanguages"
                    :options="languageOptions"
                    :size="smallSize"
                    :multiselect="true"
                    :clearable="true"
                    label="Translations" />
            </div>
        </template>
        <template #centeredContent>
            <slot :language-codes="selectedLanguageCodes" />
        </template>
        <slot name="saveButton" />
    </CenterViewTemplate>
</template>

<script>
import {
    TRANSLATIONS_LANGUAGES,
} from '@Core/defaults/cookies';
import {
    SIZE,
} from '@Core/defaults/theme';
import CenterViewTemplate from '@UI/components/Layout/Templates/CenterViewTemplate';
import TranslationSelect from '@UI/components/Select/TranslationSelect';
import {
    mapGetters,
    mapState,
} from 'vuex';

export default {
    name: 'TranslationsTab',
    components: {
        CenterViewTemplate,
        TranslationSelect,
    },
    data() {
        return {
            selectedLanguages: [],
        };
    },
    computed: {
        ...mapState('authentication', {
            userLanguageCode: state => state.user.language,
        }),
        ...mapGetters('core', [
            'activeLanguages',
            'getActiveLanguageByCode',
        ]),
        smallSize() {
            return SIZE.SMALL;
        },
        languageOptions() {
            return this.activeLanguages.map(({
                code, name,
            }) => ({
                id: code,
                key: code,
                value: name,
            }));
        },
        selectedLanguageCodes() {
            return this.selectedLanguages.map(language => language.id);
        },
    },
    watch: {
        selectedLanguages(value) {
            this.$cookies.set(TRANSLATIONS_LANGUAGES, value);
        },
    },
    created() {
        const cookieValue = this.$cookies.get(TRANSLATIONS_LANGUAGES);
        const isEveryLanguageExist = cookieValue
            ? cookieValue.every(e => this.getActiveLanguageByCode(e.key).name)
            : null;

        if (cookieValue && isEveryLanguageExist) {
            this.selectedLanguages = cookieValue;
        } else {
            this.$cookies.remove(TRANSLATIONS_LANGUAGES);
            this.selectedLanguages = [
                {
                    id: this.userLanguageCode,
                    key: this.userLanguageCode,
                    value: this.getActiveLanguageByCode(this.userLanguageCode).name,
                },
            ];
        }
    },
};
</script>

<style lang="scss" scoped>
    .translation-language-select {
        flex: 0 0 192px;
    }
</style>
