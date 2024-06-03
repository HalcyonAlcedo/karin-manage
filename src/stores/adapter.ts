import { defineStore } from 'pinia';
import { useServerStore } from './server';
import { request } from '@/utils/request';
import { adapterHandle } from '@/utils/adapter';

export const useAdapterStore = defineStore({
  id: 'adapter',
  state: () => ({
    adapter: null,
    heartbeat: null,
    messages: []
  }),
  actions: {
    async initAdapter() {
      if (this.adapter !== null) return
      const serverStore = useServerStore();
      const response = await request.post('/system/GetAdapterPort');
      if (response.data.status === 'success') {
        const time = new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
        let wsUrl: string
        if (response.data.data.wormhole) {
          wsUrl = serverStore.baseUrl.replace("web", "websocket")
        } else {
          const url = new URL(serverStore.baseUrl)
          wsUrl = `${url.protocol}//${url.hostname}:${response.data.data.port}`
        }
        wsUrl += '/onebot/v11/ws'
        wsUrl = wsUrl.replace(/^(http)(s)?(:\/\/)/, function (match, p1, p2) {
          return 'ws' + (p2 ? 's' : '') + '://';
        })
        const socket = new WebSocket(wsUrl)
        const _this = this
        socket.onopen = function (event) {
          _this.messages.push({
            time: time,
            sender: 'system',
            data: `Connect to adapter: ${wsUrl}`,
            message: `Connect to adapter: ${wsUrl}`
          })
          socket.send(JSON.stringify({ "time": Math.floor(Date.now() / 1000), "self_id": 1000, "post_type": "meta_event", "meta_event_type": "lifecycle", "sub_type": "connect" }))
          // 心跳
          _this.heartbeat = setInterval(() => {
            socket.send(JSON.stringify({
              "time": Math.floor(Date.now() / 1000),
              "self_id": 1000,
              "post_type": "meta_event",
              "meta_event_type": "heartbeat",
              "status": { "online": true, "good": true },
              "interval": 60000
            }))
          }, 30000)
        };
        socket.onmessage = function (event) {
          let message
          try {
            message = JSON.parse(event.data)
          } catch (error) {
            _this.messages.push({
              time: new Date(),
              sender: 'adapter',
              data: event.data,
              message: event.data
            })
            return
          }
          // 自动处理消息
          adapterHandle(_this, message)
        };
        // 监听错误
        socket.onerror = function (error) {
          _this.messages.push({
            time: time,
            sender: 'system',
            data: 'Close adapter',
            message: 'Close adapter',
          })
          if (_this.heartbeat) {
            clearInterval(_this.heartbeat)
            _this.heartbeat = null
          }
          _this.adapter = null
        };
        // 连接关闭时触发
        socket.onclose = function (event) {
          _this.messages.push({
            time: time,
            sender: 'system',
            data: 'Close adapter',
            message: 'Close adapter',
          })
          if (_this.heartbeat) {
            clearInterval(_this.heartbeat)
            _this.heartbeat = null
          }
          _this.adapter = null
        };
        _this.adapter = socket
      }
    },
    async closeAAdapter() {
      if (this.adapter === null) return
      if (this.heartbeat) {
        clearInterval(this.heartbeat)
        this.heartbeat = null
      }
      this.adapter.close()
      this.adapter = null
    },
    async pushMessage(msg) {
      this.messages.push(msg)
    },
    async sendMessage(data, msg) {
      if (this.adapter === null) return
      if (msg) {
        try {
          this.messages.push({
            time: new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }),
            sender: 'terminal',
            data: JSON.parse(data),
            message: msg
          })
        } catch (error) {
          return new Error(error)
        }
      }
      this.adapter.send(data)
    }
  }
});
