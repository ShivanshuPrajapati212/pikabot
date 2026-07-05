const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'pika.host',
  port: 25565,
  username: 'shivnashu398'
})

bot.once('spawn', () => {
  console.log('Bot joined the server!')
})

bot.on('messagestr', (message) => {
  console.log('[MSG]', message)

  if (message.includes('/register')) {
    console.log('Register prompt detected')
    bot.chat('/register abc123 abc123')
  }

  if (message.includes('/login')) {
    console.log('Login prompt detected')
    bot.chat('/login abc123')
  }
    if (message.includes('Right click the Server Selector to join a gamemode')){
        console.log("Opening game menu")
        bot.setQuickBarSlot(4)
        bot.activateItem()
    }
})


bot.on('windowOpen', async (window) => {
  console.log('Window opened:', window.title)
    if (window.title.value.includes('Server Selector')) {
        await bot.clickWindow(10, 0, 0);
        console.log("Clicked on Op factions")
    }
})

bot.on('chat', (username, message) => {
  console.log(`<${username}> ${message}`)
})

bot.on('kicked', console.log)
bot.on('error', console.log)
