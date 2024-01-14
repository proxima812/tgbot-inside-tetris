// Fixes an error with Promise cancellation
process.env.NTBA_FIX_319 = 'test'
const TOKEN = process.env.TOKEN

const TelegramBot = require('node-telegram-bot-api')
const questions = require('./questions')
const rulesMessage = require('./rulesMessage')
const stop10Message = require('./stop10Message')
const stop11Message = require('./stop11Message')

// Инициализируем экземпляр бота на верхнем уровне
const bot = new TelegramBot(TOKEN)

const botUsername = 'tetris_dusha_bot'




module.exports = async (request, response) => {
	try {
		const { body } = request

		if (body.message) {
			const {
				chat: { id },
				text,
			} = body.message

			// В обработчике команд
			if (text === '/q' || text === `/q@${botUsername}`) {
				const randomIndex = Math.floor(Math.random() * questions.length)
				const question = questions[randomIndex]
				const message = `🎈 Ваша тема: \n\n*"${question}"*`

				await bot.sendMessage(id, message, { parse_mode: 'Markdown' })

				// Попытка удалить сообщение с командой /q
				// try {
				//   await bot.deleteMessage(id, message_id)
				// } catch (error) {
				//   console.error('Error deleting message', error.toString())
				// }
			}

			if (text === '/rules' || text === `/rules@${botUsername}`) {
				await bot.sendMessage(id, rulesMessage, { parse_mode: 'Markdown' })
			}

			if (text === '/stop10' || text === `/stop10@${botUsername}`) {
				await bot.sendMessage(id, stop10Message, {
					parse_mode: 'Markdown',
					disable_web_page_preview: true,
				})
			}

			if (text === '/stop11' || text === `/stop11@${botUsername}`) {
				await bot.sendMessage(id, stop11Message, { parse_mode: 'Markdown' })
			}
		}
	} catch (error) {
		console.error('Error in bot operation:', error.toString())
	}

	response.send('OK')
}
