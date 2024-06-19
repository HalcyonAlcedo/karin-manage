// utils/adapter.js
export const adapterHandle = (adapter, data) => {
  const echo = data.echo
  const time = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  let msg = ''
  let image = []
  switch (data.action) {
    case 'get_login_info':
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: {
          user_id: 1000,
          nickname: "Manage"
        },
        message: '',
        wording: '',
        echo: echo
      }))
      break;
    case 'get_version_info':
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: {
          'app_name': 'KarinManage',
          'protocol_version': 'v11',
          'app_version': '1.0.0'
        },
        message: '',
        wording: '',
        echo: echo
      }))
      break;
    case 'get_friend_list':
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: [{
          user_id: 1001,
          nickname: '虚拟终端',
          remark: '',
          sex: 'female',
          level: 0
        }],
        message: '',
        wording: '',
        echo: echo
      }))
      break;
    case 'get_group_list':
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: [{
          group_id: 1000,
          group_name: '虚拟终端群',
          member_count: 1,
          max_member_count: 1
        }],
        message: '',
        wording: '',
        echo: echo
      }))
      break;
    case 'send_group_msg':

      for (const message of data.params.message) {
        if (message.type === 'text') {
          msg += `${message.data.text}`
        }
        if (message.type === 'at') {
          msg += `@${message.data.qq} `
        }
        if (message.type === 'image') {
          image.push(message.data.file.replace(/^base64:\/\//, ''))
        }
      }
      adapter.pushMessage({
        time: time,
        sender: 'adapter',
        data: data,
        message: msg,
        image
      })
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: {
          message_id: parseInt(Math.floor(Date.now() / 1000).toString().slice(0, 9), 10)
        },
        echo: echo
      }))
      break;
    case 'send_private_msg':
      for (const message of data.params.message) {
        if (message.type === 'text') {
          msg += `${message.data.text}\n`
        }
        if (message.type === 'at') {
          msg += `@${message.data.qq} `
        }
        if (message.type === 'image') {
          image.push(message.data.file.replace(/^base64:\/\//, ''))
        }
      }
      adapter.pushMessage({
        time: time,
        sender: 'adapter',
        data: data,
        message: msg,
        image
      })
      adapter.sendMessage(JSON.stringify({
        status: 'ok',
        retcode: 0,
        data: {
          message_id: parseInt(Math.floor(Date.now() / 1000).toString().slice(0, 9), 10)
        },
        echo: echo
      }))
      break;
    default:
      if (data.action) {
        adapter.pushMessage({
          time: time,
          sender: 'adapter',
          data: data,
          message: '未知消息类型'
        })
      }
      break;
  }
}