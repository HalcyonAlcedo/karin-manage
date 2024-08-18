<script setup lang="ts">
import { ref, shallowRef, computed, type Ref } from "vue"
import { request } from '@/utils/request';
import axios from 'axios'

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import MarkdownRenderer from './components/MarkdownRenderer.vue';

import { useSnackbarStore } from '@/stores/snackbar';

interface PluginInfo {
    app: string // 插件
    view: {
        title: string, // 标题
        subtitle?: string, // 副标题
        text?: string, // 插件描述
        author?: string, // 作者
        icon?: string, // 插件图标
        dev?: boolean, // 插件处于开发状态
        home?: string // 插件主页
    },
    install?: (string | {
        linux: string;
        win: string;
    })[], // 安装流程
    uninstall?: (string | {
        linux: string;
        win: string;
    })[], // 卸载流程
    installable?: boolean, // 是否可安装
    npm?: string, // npm包名称
    git?: string, // git连接
    // 插件描述
    readme?: {
        markdown?: string,
        url?: string[]
    },
    version: string // 版本
}

const snackbarStore = useSnackbarStore()

const breadcrumbs = shallowRef([
    {
        title: '插件商店',
        disabled: false,
        href: '#'
    }
]);

const pluginsCount = ref(0)
const plugins: Ref<PluginInfo[]> = ref([]);
const localPlugins: Ref<{ app: string, version: string | null }[]> = ref([
    {
        app: 'manage',
        version: '1.1.0'
    }
]);
const appInfo: Ref<PluginInfo | undefined> = ref()
const executeDialog = ref(false)
const executeMaxStep = ref(0)
const executeStep: Ref<(string | {
    linux: string;
    win: string;
})[]> = ref([])

const dialog = computed(() => {
    return appInfo.value !== undefined
})

/**
 * 检查是否已经安装
 * @param app 
 */
const checkInstalled = (app: string) => {
    return localPlugins.value.some(item => item.app === app)
}
/**
 * 检查是否有更新
 * @param app 
 * @param version 
 */
const checkUpdate = (app: string, version: string) => {
    const compareVersions = (v1: string, v2: string) => {
        const v1Parts = v1.split('.').map(Number);
        const v2Parts = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const part1 = v1Parts[i] || 0 // If a part is missing, treat it as 0
            const part2 = v2Parts[i] || 0

            if (part1 < part2) return -1
            if (part1 > part2) return 1
        }

        return 0 // If all parts are equal
    }
    return localPlugins.value.some(item => item.app === app && item.version && compareVersions(item.version, version) < 0)
}
/**
 * 获取商店插件信息
 */
const getPluginsData = async ({ done }: any) => {
    /* 暂时不使用分页策略
        axios.get('http://dev.alcedo.top/getdata.php', { params: { start: pluginsCount.value } }).then((data) => {
            if (data.data.length === 0) {
                done('empty')
            } else {
                plugins.value.push(...data.data)
                pluginsCount.value += data.data.length
                done('ok')
            }
        })
    */
    axios.get(`https://halcyonalcedo.github.io/karin-store/plugins.json?timestamp=${new Date().getTime()}`).then((data) => {
        plugins.value.push(...data.data)
        done('empty')
    })
}
/**
 * 获取本地已安装插件信息
 */
const getLocalPluginsData = () => {
    localPlugins.value = []
    request.post('/config/GetPluginList')
        .then((data) => {
            if (data.data?.status === 'success') {
                data.data.data.forEach((element: string) => {
                    request.post('/config/GetPluginInfo', { plugin: element }).then((info) => {
                        if (info.data?.status === 'success') {
                            localPlugins.value.push({
                                app: element,
                                version: info.data.data.version
                            })
                        } else {
                            snackbarStore.open(`本地插件信息获取失败`, 'error')
                        }
                    }).catch((error) => {
                        snackbarStore.open(`本地插件信息获取失败${error}`, 'error')
                    })
                })
            } else {
                snackbarStore.open(`本地插件信息获取失败`, 'error')
            }
        })
        .catch((error) => {
            snackbarStore.open(`本地插件信息获取失败${error}`, 'error')
        })
}
/**
 * 生成安装步骤
 * @param plugin 
 */
const getInstallStep = (plugin: PluginInfo) => {
    if (plugin.npm) {
        return [`pnpm install ${plugin.npm}`]
    } else if (plugin.git) {
        return [
            `git clone ${plugin.git} ./plugins/${plugin.app}`,
            `pnpm install --filter=${plugin.app}`
        ]
    }
    return []
}
/**
 * 生成卸载步骤
 * @param plugin 
 */
const getUninstallStep = (plugin: PluginInfo) => {
    if (plugin.npm) {
        return [`pnpm remove ${plugin.npm}`]
    } else if (plugin.git) {
        return [{
            linux: `rm -rf ./plugins/${plugin.app}`,
            win: `rmdir /s /q .\\plugins\\${plugin.app}`,
        }]
    }
    return []
}
/**
 * 执行安装或卸载流程
 * @param plugin 
 */
const execute = (plugin: PluginInfo) => {
    if (checkInstalled(plugin.app)) {
        executeStep.value = plugin.uninstall || getUninstallStep(plugin)

    } else {
        executeStep.value = plugin.install || getInstallStep(plugin)
    }
    executeMaxStep.value = executeStep.value.length
    executeDialog.value = true

    postExecute()
}
const postExecute = () => {
    const executeEnd = () => {
        executeDialog.value = false
        executeMaxStep.value = 0
        executeStep.value = []
    }
    if (executeStep.value && executeMaxStep.value - executeStep.value.length < executeMaxStep.value) {
        const step = executeStep.value.shift()
        request.post('/system/Execute', { cmd: step }).then((data) => {
            if (data.data?.status === 'success') {
                postExecute()
            } else {
                executeEnd()
                snackbarStore.open(`执行安装操作发生错误`, 'error')
            }
        }).catch((error) => {
            executeEnd()
            snackbarStore.open(`执行安装操作发生错误${error}`, 'error')
        })
    }
    if (executeMaxStep.value - executeStep.value.length === executeMaxStep.value) {
        executeEnd()
        getLocalPluginsData()
    }
}

getLocalPluginsData()
</script>

<template>
    <BaseBreadcrumb title="插件商店" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-infinite-scroll :items="plugins" :onLoad="getPluginsData" style="overflow: hidden;">
        <v-row dense>
            <template v-for="plugin in plugins" :key="plugin.app">
                <v-col cols="12" md="6">
                    <v-card class="mx-auto" :subtitle="plugin.view.subtitle" :title="plugin.view.title">

                        <template v-slot:prepend>
                            <v-avatar color="blue-darken-2">
                                <v-icon :icon="plugin.view.icon || 'mdi-store'"></v-icon>
                            </v-avatar>
                        </template>

                        <template v-slot:append>
                            <v-btn
                                v-if="((plugin.install || plugin.npm || plugin.git) && plugin.installable) || checkInstalled(plugin.app)"
                                :append-icon="checkInstalled(plugin.app) ? 'mdi-dots-vertical' : ''">
                                <template v-slot:prepend>
                                    <v-icon
                                        :icon="checkInstalled(plugin.app) ? 'mdi-check' : 'mdi-download-box-outline'"
                                        :color="checkInstalled(plugin.app) ? 'success' : 'warning'"></v-icon>
                                </template>
                                {{ checkInstalled(plugin.app) ? '已安装' : '安装' }}

                                <v-dialog activator="parent">
                                    <template v-slot:default="{ isActive }">
                                        <v-card rounded="lg">
                                            <v-card-title class="d-flex justify-space-between align-center">
                                                <div class="text-h5 text-medium-emphasis ps-2">
                                                    {{ plugin.view.title }}
                                                </div>

                                                <v-btn icon="mdi-close" variant="text"
                                                    @click="isActive.value = false"></v-btn>
                                            </v-card-title>

                                            <v-divider class="mb-4"></v-divider>

                                            <v-card-text>
                                                <div class="text-medium-emphasis mb-4">
                                                    {{ checkInstalled(plugin.app) ? `${plugin.view.title}
                                                    插件已经安装，是否需要卸载安装？`: `是否安装 ${plugin.view.title} 插件？` }}
                                                </div>
                                                <v-divider class="mb-4"></v-divider>
                                                <div v-if="!checkInstalled(plugin.app)">
                                                    <div class="mb-2">安装流程</div>
                                                    <v-list density="compact">
                                                        <v-alert v-if="!plugin.install" density="compact"
                                                            text="当前插件并未提供安装流程，安装流程为自动生成，可能无法正常安装！" title="安装警告"
                                                            type="warning"></v-alert>
                                                        <v-list-item
                                                            v-for="(step, key) in plugin.install || getInstallStep(plugin)"
                                                            :key="key"
                                                            :title="typeof step === 'string' ? step : `win: ${step.win} | linux: ${step.linux}`"
                                                            base-color="primary"></v-list-item>
                                                    </v-list>
                                                </div>
                                                <div v-else>
                                                    <div class="mb-2">卸载流程</div>
                                                    <v-list density="compact">
                                                        <div v-if="plugin.uninstall">
                                                            <v-list-item v-for="(step, key) in plugin.uninstall"
                                                                :key="key"
                                                                :title="typeof step === 'string' ? step : `win: ${step.win} | linux: ${step.linux}`"
                                                                base-color="primary"></v-list-item>

                                                        </div>
                                                        <div v-else>
                                                            <v-alert density="compact"
                                                                text="当前插件并未提供卸载流程，卸载流程为自动生成，可能无法正常卸载！" title="卸载警告"
                                                                type="warning"></v-alert>
                                                            <v-list-item v-for="(step, key) in getUninstallStep(plugin)"
                                                                :key="key"
                                                                :title="typeof step === 'string' ? step : `win: ${step.win} | linux: ${step.linux}`"
                                                                base-color="primary"></v-list-item>
                                                        </div>
                                                    </v-list>
                                                </div>
                                            </v-card-text>

                                            <v-divider class="mt-2"></v-divider>

                                            <v-card-actions class="my-2 d-flex justify-end">
                                                <v-btn class="text-none" rounded="xl" text="取消"
                                                    @click="isActive.value = false"></v-btn>

                                                <v-btn class="text-none" color="primary" rounded="xl"
                                                    :text="checkInstalled(plugin.app) ? '卸载' : '安装'" variant="flat"
                                                    @click="execute(plugin); isActive.value = false"></v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </template>
                                </v-dialog>
                            </v-btn>
                            <v-btn v-else disabled>
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-close" color="error"></v-icon>
                                </template>
                                {{ plugin.installable ? '无法安装' : '禁止安装' }}
                            </v-btn>
                        </template>

                        <v-divider />

                        <v-card-text v-html="plugin.view.text"></v-card-text>

                        <v-divider />

                        <v-card-actions class="pa-4">
                            <v-chip color="secondary" class="ma-2" size="small" variant="outlined">
                                版本 {{ plugin.version }}
                            </v-chip>
                            <v-chip v-if="plugin.view.dev" color="warning" class="ma-2" size="small" variant="outlined">
                                开发中
                            </v-chip>
                            <v-chip v-if="checkUpdate(plugin.app, plugin.version)" color="teal" class="ma-2"
                                size="small" variant="outlined">
                                发现更新
                            </v-chip>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" prepend-icon="mdi-open-in-new" class="text-none" size="small"
                                variant="flat" flat @click="appInfo = plugin">详情</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </template>
        </v-row>
        <template v-slot:empty>
        </template>
    </v-infinite-scroll>
    <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
        <v-card>
            <v-toolbar>
                <v-toolbar-title>{{ appInfo?.view.title }}</v-toolbar-title>
                <v-spacer></v-spacer>
                {{ appInfo?.view.home }}
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="appInfo = undefined"></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <MarkdownRenderer :app="appInfo" />
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="executeDialog" max-width="320" persistent>
        <v-list class="py-2" color="primary" elevation="12" rounded="lg">
            <v-list-item prepend-icon="mdi-dns-outline">
                <template v-slot:prepend>
                    <div class="pe-4">
                        <v-icon color="primary" size="x-large"></v-icon>
                    </div>
                </template>
                <v-sheet class="d-flex align-center px-4 py-8 mx-auto" max-width="250" rounded="lg">
                    <v-progress-linear bg-color="#92aed9" buffer-color="#6a3e0b" buffer-opacity="1" buffer-value="3"
                        color="#12512a" height="12" :max="executeMaxStep" min="0"
                        :model-value="executeMaxStep - executeStep.length" rounded></v-progress-linear>
                    <div class="ms-4 text-h6">{{ executeMaxStep - executeStep.length }}/{{ executeMaxStep }}</div>
                </v-sheet>
            </v-list-item>
        </v-list>
    </v-dialog>
</template>