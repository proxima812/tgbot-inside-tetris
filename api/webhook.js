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

// Объект для отслеживания времени последней отправки команд
const lastCommandUsage = {};

// Функция для проверки анти-спама
function canUseCommand(chatId, command) {
  const currentTime = Date.now();
  const timeLimit = 180000 // 5 минут в миллисекундах

  if (!lastCommandUsage[chatId]) {
    lastCommandUsage[chatId] = {};
  }

  if (lastCommandUsage[chatId][command] && currentTime - lastCommandUsage[chatId][command] < timeLimit) {
    return false; // команда использовалась менее 5 минут назад
  }

  // Обновляем время использования команды
  lastCommandUsage[chatId][command] = currentTime;
  return true;
}

module.exports = async (request, response) => {
	try {
		const { body } = request

		if (body.message) {
			const {
				message_id,
				chat: { id },
				text,
			} = body.message

			if (text === '/q' || text === `/q@${botUsername}`) {
				const randomIndex = Math.floor(Math.random() * questions.length)
				const question = questions[randomIndex]
				const message = `🎈 Ваша тема: \n\n*"${question}"*`

				await bot.sendMessage(id, message, { parse_mode: 'Markdown' })
			}

			if (text === '/rules' || text === `/rules@${botUsername}`) {
				await bot.sendMessage(id, rulesMessage, { parse_mode: 'Markdown' })
				try {
					await bot.deleteMessage(id, message_id)
				} catch (error) {
					console.error('Error deleting message', error.toString())
				}
			}

			// if (text === '/stop10' || text === `/stop10@${botUsername}`) {
			// 	await bot.sendMessage(id, stop10Message, {
			// 		parse_mode: 'Markdown',
			// 		disable_web_page_preview: true,
			// 	})
			// 	try {
			// 		await bot.deleteMessage(id, message_id)
			// 	} catch (error) {
			// 		console.error('Error deleting message', error.toString())
			// 	}
      // }
      
      if (text === '/stop10' || text === `/stop10@${botUsername}`) {
				if (canUseCommand(id, 'stop10')) {
					await bot.sendMessage(id, stop10Message, {
						parse_mode: 'Markdown',
						disable_web_page_preview: true,
					})
				} else {
					// Отправить сообщение о блокировке команды из-за анти-спама
					await bot.sendMessage(
						id,
						'Пожалуйста, подождите 3 миниты перед повторным использованием команды.',
					)
				}
			}

			if (text === '/stop11' || text === `/stop11@${botUsername}`) {
				await bot.sendMessage(id, stop11Message, { parse_mode: 'Markdown' })
				try {
					await bot.deleteMessage(id, message_id)
				} catch (error) {
					console.error('Error deleting message', error.toString())
				}
			}
		}
	} catch (error) {
		console.error('Error in bot operation:', error.toString())
	}

	response.send('OK')
}
