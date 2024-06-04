<script setup>
import { inject } from 'vue';
import { debounce } from 'lodash';

const props = defineProps({
    data: Array,
    view: Array,
    file: String,
    title: String,
    subtitle: String
})

const processData = inject('processData')

const updateDataValue = (array, targetPath, newValue) => {
  array.forEach(item => {
    if (item.path === targetPath) {
      item.value = newValue;
    }
    if (item.value === null || item.value === undefined) {
        return
    }
    // 如果value是数组，递归调用函数
    if (Array.isArray(item.value)) {
        updateDataValue(item.value, targetPath, newValue);
    }
    // 如果value是对象，将其转换为数组后递归调用函数
    else if (typeof item.value === 'object') {
        updateDataValue(Object.values(item.value), targetPath, newValue);
    }
  });
}
const setConfig = (path, value, type) => {
    if (Array.isArray(value)) {
        for (let i in value) {
            if (type === 'number') {
                value[i] = Number(value[i])
            }
            if (type === 'string') {
                value[i] = value[i].toString()
            }
        }
    } else {
        if (type === 'number') {
            value = Number(value)
        }
        if (type === 'string') {
            value = value.toString()
        }
    }
    updateDataValue(props.data, path, value)
    processData(path, value, props.file)
}
const debouncedSetConfig = debounce((path, value, type) => {
    setConfig(path, value, type);
}, 500); // 延迟500毫秒
</script>

<template>
    <div class="pa-4">
        <v-card :title="title" :subtitle="subtitle">
            <v-card-text>
                <v-row dense>
                    <v-col v-for="(item, index) in props.data" :key="index" cols="12">
                        <VSelect
                            v-if="item.type === 'select' && item.item"
                            :modelValue="item.value"
                            :hint="item.comment"
                            :items="item.item"
                            :label="item.key"
                            :multiple="item.multiple"
                            @update:modelValue="setConfig(item.path, $event, typeof item.value)"
                            item-title="name"
                            item-value="value"
                            required clearable variant="outlined" />
                        <VTextField
                            v-else-if="(item.type === 'text' || item.type === 'url' || item.type === 'number' || item.type === 'password' || typeof item.value === 'string' && item.value !== 'NULL') || typeof item.value === 'number' || (item.type === 'select' && !item.item)"
                            :modelValue="item.value" :label="item.key" :hint="item.comment" :append-inner-icon="item.type === 'password' ? (item.visible ? 'mdi-eye-off' : 'mdi-eye') : false"
                            :type="item.type ? ((item.type === 'password' && item.visible) ? 'text' : item.type) : 'text'" :prefix="item.prefix" :suffix="item.suffix"
                            @input="debouncedSetConfig(item.path, $event.target.value, typeof item.value)" @click:append-inner="item.visible = !item.visible"
                            required clearable variant="outlined" />
                        <VCheckbox v-else-if="item.type === 'boolean' || typeof item.value === 'boolean'" :modelValue="item.value"
                            @change="setConfig(item.path, $event.target.checked, typeof item.value)">
                            <template v-slot:label>
                                <VTooltip v-if="item.comment" location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <b v-bind="props">
                                            {{item.key}}
                                        </b>
                                    </template>
                                    {{item.comment}}
                                </VTooltip>
                                <b v-else> {{item.key}} </b>
                            </template>
                        </VCheckbox>
                        <template v-else-if="Array.isArray(item.value)">
                            <!--判断是纯数组还是对象数组-->
                            <recursive-editor v-if="item.value.some(element => typeof element == 'object')"
                                :file="props.file" :data="item.value" :title="item.key" :subtitle="item.comment" />
                            <v-container v-else>
                                <v-card rounded="lg">
                                    <v-card-title class="d-flex justify-space-between align-center">
                                        <div class="text-h3 text-medium-emphasis ps-2">
                                            {{ item.key }}
                                        </div>
                                        <v-btn-toggle
                                            v-model="item.arrayType"
                                            variant="outlined"
                                            divided
                                            >
                                            <v-btn icon="mdi-alphabetical" value="string"></v-btn>
                                            <v-btn icon="mdi-numeric" value="number"></v-btn>
                                        </v-btn-toggle>
                                        <v-btn @click="item.value.push('')" icon="mdi-plus" variant="text"></v-btn>
                                    </v-card-title>
                                    <v-card-subtitle>{{ item.comment }}</v-card-subtitle>
                                    <v-divider class="mb-4"></v-divider>
                                    <v-card-text>
                                        <v-row v-for="(arritem, arrindex) in item.value" :key="arrindex">
                                            <v-col>
                                                <v-text-field
                                                    :label="'值 ' + (arrindex + 1)" v-model="item.value[arrindex]"
                                                    @input="debouncedSetConfig(item.path, item.value, item.arrayType || 'string')" 
                                                    :type="item.arrayType || 'string'" append-icon="mdi-delete" @click:append="item.value.splice(arrindex, 1) && debouncedSetConfig(item.path, item.value, item.arrayType || 'string')"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-container>
                        </template>
                        <!-- 自定义 -->
                        <v-card v-else class="mx-auto">
                            <v-card-text>
                                <div>{{ item.comment }}</div>

                                <p class="text-h4 font-weight-black">{{ item.key }}</p>

                                <v-expansion-panels>
                                    <!-- 字符串 -->
                                    <v-expansion-panel>
                                        <v-expansion-panel-title v-slot="{ expanded }">
                                            <v-row no-gutters>
                                                <v-col class="d-flex justify-start" cols="4">
                                                    字符串
                                                </v-col>
                                                <v-col class="text--secondary" cols="8">
                                                    <v-fade-transition leave-absolute>
                                                        {{item.value}}
                                                    </v-fade-transition>
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text>
                                            <v-card-text>
                                                <VTextField :modelValue="item.value" :label="item.key"
                                                    :hint="item.comment"
                                                    @input="debouncedSetConfig(item.path, $event.target.value, 'string')"
                                                    required clearable variant="outlined" />
                                            </v-card-text>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <!--  数字 -->
                                    <v-expansion-panel>
                                        <v-expansion-panel-title v-slot="{ expanded }">
                                            <v-row no-gutters>
                                                <v-col class="d-flex justify-start" cols="4">
                                                    数字
                                                </v-col>
                                                <v-col class="text--secondary" cols="8">
                                                    <v-fade-transition leave-absolute>
                                                        {{item.value}}
                                                    </v-fade-transition>
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text>
                                            <v-card-text>
                                                <VTextField :modelValue="item.value" :label="item.key"
                                                    :hint="item.comment"
                                                    @input="debouncedSetConfig(item.path, $event.target.value, 'number')"
                                                    required clearable variant="outlined" type="number" />
                                            </v-card-text>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                    <!--  选择 -->
                                    <v-expansion-panel>
                                        <v-expansion-panel-title v-slot="{ expanded }">
                                            <v-row no-gutters>
                                                <v-col class="d-flex justify-start" cols="4">
                                                    选择
                                                </v-col>
                                                <v-col class="text--secondary" cols="8">
                                                    <v-fade-transition leave-absolute>
                                                        {{item.value}}
                                                    </v-fade-transition>
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text>
                                            <VCheckbox :modelValue="item.value"
                                                @change="setConfig(item.path, $event.target.checked, typeof item.value)">
                                                <template v-slot:label>
                                                    <VTooltip v-if="item.comment" location="bottom">
                                                        <template v-slot:activator="{ props }">
                                                            <b v-bind="props">
                                                                {{item.key}}
                                                            </b>
                                                        </template>
                                                        {{item.comment}}
                                                    </VTooltip>
                                                    <b v-else> {{item.key}} </b>
                                                </template>
                                            </VCheckbox>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>
