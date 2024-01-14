// Fixes an error with Promise cancellation
process.env.NTBA_FIX_319 = 'test'
const TOKEN = process.env.API_TOKEN

// Проверяем, что токен доступен
if (!TOKEN) {
	console.error('Telegram Bot Token is not provided!')
	process.exit(1) // Завершаем выполнение, если токен не предоставлен
}

const TelegramBot = require('node-telegram-bot-api')
const questions = require('./questions')
const { rulesMessage, stop11Message, stop10Message } = require('./MsgCommands')

// Создаем экземпляр бота на верхнем уровне
const bot = new TelegramBot(TOKEN)

let messageIds = new Map()
const botUsername = 'tetris_dusha_bot'

// Функция для проверки, является ли сообщение командой
function isCommand(text) {
	const commands = [
		'/q',
		`/q@${botUsername}`,
		'/rules',
		`/rules@${botUsername}`,
		'/stop11',
		`/stop11@${botUsername}`,
		'/stop10',
		`/stop10@${botUsername}`,
	]
	return commands.includes(text)
}

// Функция для добавления ID сообщения в Map
function addMessageId(chatId, messageId, text) {
	if (isCommand(text) && !messageIds.has(chatId)) {
		messageIds.set(chatId, [])
	}
	if (isCommand(text)) {
		messageIds.get(chatId).push(messageId)
	}
}

// Функция для удаления предыдущих сообщений
function deletePreviousMessages(chatId, bot) {
	if (messageIds.has(chatId)) {
		const ids = messageIds.get(chatId)
		ids.forEach(id => {
			bot
				.deleteMessage(chatId, id)
				.catch(error => console.error('Error deleting message', error.toString()))
		})
		messageIds.set(chatId, []) // Очищаем массив после удаления сообщений
	}
}


// Экспортируем функцию как асинхронную
module.exports = async (request, response) => {
	try {
		const { body } = request
		if (body.message) {
			const {
				message_id,
				chat: { id },
				text,
			} = body.message

			addMessageId(id, message_id, text)

			if (isCommand(text)) {
				deletePreviousMessages(id)
			}

			if (text === '/q' || text === `/q@${botUsername}`) {
				const randomIndex = Math.floor(Math.random() * questions.length)
				const question = questions[randomIndex]
				const message = `🎈 Ваша тема: \n\n*"${question}"*`

				await bot
					.sendMessage(id, message, { parse_mode: 'Markdown' })
					.then(sentMessage => {
						addMessageId(id, sentMessage.message_id) // Добавляем ID сообщения бота
					})
					.catch(error => console.error('Error sending message', error.toString()))

				// Попытка удалить сообщение с командой /q
				// try {
				//   await bot.deleteMessage(id, message_id)
				// } catch (error) {
				//   console.error('Error deleting message', error.toString())
				// }
			}

			if (text === '/rules' || text === `/rules@${botUsername}`) {
				await bot
					.sendMessage(id, rulesMessage, { parse_mode: 'Markdown' })
					.then(sentMessage => {
						addMessageId(id, sentMessage.message_id) // Добавляем ID сообщения бота
					})
					.catch(error => console.error('Error sending message', error.toString()))
			}

			if (text === '/stop10' || text === `/stop10@${botUsername}`) {
				await bot
					.sendMessage(id, stop10Message, { parse_mode: 'Markdown' })
					.then(sentMessage => {
						addMessageId(id, sentMessage.message_id) // Добавляем ID сообщения бота
					})
					.catch(error => console.error('Error sending message', error.toString()))
			}

			if (text === '/stop11' || text === `/stop11@${botUsername}`) {
				await bot
					.sendMessage(id, stop11Message, { parse_mode: 'Markdown' })
					.then(sentMessage => {
						addMessageId(id, sentMessage.message_id) // Добавляем ID сообщения бота
					})
					.catch(error => console.error('Error sending message', error.toString()))
			}
		}
	} catch (error) {
		console.error('Error in bot operation:', error.toString())
	}

	response.send('OK')
}
