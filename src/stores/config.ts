import { defineStore } from 'pinia';
import { request } from '@/utils/request';
import {
  PlugIcon,
  DashboardIcon,
  ConeIcon
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
    sidebarItems: [
      { header: '主页' },
      {
        title: '面板主页',
        icon: DashboardIcon,
        to: '/dashboard/default'
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
        this.updataSidebarItems()
      } catch (error) {
        throw new Error('服务器错误')
      }
    },
    updataSidebarItems() {
      let items = [
        { header: '主页' },
        {
          title: '面板主页',
          icon: DashboardIcon,
          to: '/dashboard/default'
        },
      ]
      let plugin = [
        { divider: true },
        { header: '插件配置' }
      ]
      let karin = [
        { divider: true },
        { header: 'Karin配置' }
      ]
      // 加入karin配置
      for (let item of this.karins) {
        karin.push({
          title: item,
          icon: ConeIcon,
          to: `/karin/${item}`
        })
      }
      // 加入插件配置
      for (let item of this.plugins) {
        plugin.push({
          title: item,
          icon: PlugIcon,
          to: `/plugin/${item}`
        })
      }
      this.sidebarItems = [...items,...karin,...plugin]
    }
  }
});
