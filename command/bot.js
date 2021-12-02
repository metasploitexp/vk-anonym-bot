const vkBot = require('node-vk-bot-api')
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const config = require('config')
const e = require('express')

const bot = new vkBot({
    token: config.get('token'),
    group_id: config.get('groupId')
})


bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        console.log(error)
    }
})

const scene = new Scene('start',
    (ctx) => {
        ctx.scene.next()
        ctx.reply('Введите айди пользователя')
    },
    (ctx) => {
        if (ctx.message.text.lastIndexOf('/') !== -1) {
            ctx.session.userId = ctx.message.text.slice(ctx.message.text.lastIndexOf('/')+1, ctx.message.text.length)
            console.log('ctx.session.userId', ctx.session.userId)
        } else {
            ctx.session.userId = ctx.message.text
        }
        ctx.scene.next()
        ctx.reply('Введите сообщение для пользователя')
    },
    async (ctx) => {
        try {
            ctx.session.message = ctx.message.text
            ctx.scene.leave()
            ctx.reply(`To: @${ctx.session.userId}, message: ${ctx.session.message}`)
            const response = await bot.execute('users.get', {
                user_ids: ctx.session.userId,
            })
            console.log(response[0].id)
            if (response[0].id) {
               await bot.sendMessage(response[0].id, ctx.session.message)
            }
        } catch (error) {
            console.log(error)
        }
    }
);
const session = new Session();
const stage = new Stage(scene);

bot.use(session.middleware());
bot.use(stage.middleware());

bot.on((ctx, next) => {
    const commandList = new Array([
        '/start'
    ])
    for(let i = 0; i < commandList.length; i++) {
        if (ctx.message.text == commandList[i]) {
            next()
        } else {
            ctx.reply('Чтобы начать введите команду /start ')
        }
    }
})

bot.command('/start', (ctx) => {
    ctx.scene.enter('start')
    console.log(ctx.session)
})

bot.startPolling((err) => {
    if (err) {
      console.error(err);
    }
})

module.exports = bot