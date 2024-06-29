import { defineStore } from 'pinia';
import { request } from '@/utils/request';
import {
  PlugIcon,
  DashboardIcon,
  ConeIcon,
  UserBoltIcon,
  TopologyStarIcon,
  DatabaseCogIcon,
  TerminalIcon,
  CloudComputingIcon,
  BrandVueIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    plugins: [],
    karins: [],
    version: '0.0.0',
    sidebarItems: [
      { header: '主页' },
      {
        title: '面板主页',
        icon: DashboardIcon,
        to: '/dashboard/default'
      },
      { divider: true },
      { header: '系统' },
      {
        title: '虚拟客户端',
        icon: CloudComputingIcon,
        to: '/system/vclient'
      },
      {
        title: '远程终端',
        icon: TerminalIcon,
        to: '/system/terminal'
      },
      {
        title: '运行日志',
        icon: TopologyStarIcon,
        to: '/system/logs'
      },
      {
        title: '数据库',
        icon: DatabaseCogIcon,
        to: '/system/database'
      },
      { divider: true },
      { header: '用户' },
      {
        title: '用户管理',
        icon: UserBoltIcon,
        to: '/user/'
      },
      { divider: true },
      { header: '开发' },
      {
        title: '渲染页面开发',
        icon: BrandVueIcon,
        to: '/dev/renderer'
      }
    ]
  }),
  actions: {
    async getConfigs() {
      try {
        // 获取插件列表
        const pluginResponse = await request.post('/config/GetPluginList');
        if (pluginResponse.data.status === 'success') {
          this.plugins = pluginResponse.data.data
        } else {
          throw new Error(pluginResponse.data.message)
        }
        // 获取Karin配置列表
        const karinResponse = await request.post('/config/GetKarinConfigList');
        if (karinResponse.data.status === 'success') {
          this.karins = karinResponse.data.data
        } else {
          throw new Error(karinResponse.data.message)
        }
        // 获取Karin配置列表
        const karinVersion = await request.post('/system/GetKarinVersion');
        if (karinVersion.data.status === 'success') {
          this.version = karinVersion.data.data
        }
      } catch (error) {
        throw new Error(`服务器错误：${error}`)
      }
      this.updataSidebarItems()
    },
    updataSidebarItems() {
      let plugin = []
      let karin = []
      // 加入karin配置
      for (let item of this.karins) {
        karin.push({
          title: item,
          to: `/karin/${item}`
        })
      }
      // 加入插件配置
      for (let item of this.plugins) {
        plugin.push({
          title: item.name?.replace(/^karin-plugin-/, '') || item.replace(/^karin-plugin-/, ''),
          to: `/plugin/${item.name || item}`
        })
      }
      this.sidebarItems = [
        { header: '主页' },
        {
          title: '面板主页',
          icon: DashboardIcon,
          to: '/dashboard/default'
        },
        { divider: true },
        { header: '配置' },
        {
          title: 'Karin配置',
          icon: ConeIcon,
          children: karin
        },
        {
          title: '插件配置',
          icon: PlugIcon,
          children: plugin
        },
        { divider: true },
        { header: '系统' },
        {
          title: '虚拟客户端',
          icon: CloudComputingIcon,
          to: '/system/vclient'
        },
        {
          title: '远程终端',
          icon: TerminalIcon,
          to: '/system/terminal'
        },
        {
          title: '运行日志',
          icon: TopologyStarIcon,
          to: '/system/logs'
        },
        {
          title: '数据库',
          icon: DatabaseCogIcon,
          to: '/system/database'
        },
        { divider: true },
        { header: '用户' },
        {
          title: '用户管理',
          icon: UserBoltIcon,
          to: '/user/'
        },
        { divider: true },
        { header: '开发' },
        {
          title: '渲染页面开发',
          icon: BrandVueIcon,
          to: '/dev/renderer'
        }
      ]
    }
  }
});
