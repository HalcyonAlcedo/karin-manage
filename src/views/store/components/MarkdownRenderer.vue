<script setup lang="ts">
import { ref, watch } from "vue"
import { marked, type MarkedOptions } from 'marked'
import hljs from 'highlight.js'
import axios from 'axios'

import 'github-markdown-css/github-markdown.css'

interface PluginInfo {
    app: string // 插件
    view: {
        title: string, // 标题
        subtitle?: string, // 副标题
        text?: string, // 插件描述
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

interface Props {
    app: PluginInfo | undefined
}

const props = defineProps<Props>();
const renderedMarkdown = ref<string>('Loading...')

// 配置 marked 以支持代码高亮
marked.setOptions({
    highlight: (code: string, lang: string) => {
        return hljs.highlightAuto(code).value
    },
} as MarkedOptions & { highlight: (code: string, lang: string) => string });


const fetchMarkdown = async (urls: string[]) => {
    let error
    for (const url of urls) {
        try {
            const response = await axios.get<string>(url, { timeout: 20000 })
            renderedMarkdown.value = await marked(response.data)
            return // 成功后退出函数，不再继续尝试其他URL
        } catch (err) {
            error = err
            console.error(`Failed to fetch from ${url}:`, error)
        }
    }
    // 如果所有URL都尝试失败，设置错误信息
    renderedMarkdown.value = '加载说明文件出错'
}


watch(() => props.app, async (app) => {
    if (app?.readme) {
        if (app.readme.url) {
            fetchMarkdown(app.readme.url)
        }
        if (app.readme.markdown) {
            renderedMarkdown.value = await marked(app.readme.markdown)
        }
    } else {
        renderedMarkdown.value = '当前插件无说明文件'
    }
}, { immediate: true })

</script>

<style scoped>
.markdown-body {
    padding: 20px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>


<template>
    <div class="markdown-body" v-html="renderedMarkdown"></div>
</template>
