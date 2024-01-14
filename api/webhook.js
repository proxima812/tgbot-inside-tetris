// Fixes an error with Promise cancellation
process.env.NTBA_FIX_319 = 'test'
const TOKEN = process.env.TOKEN

const TelegramBot = require('node-telegram-bot-api')
const questions = require('./questions')

// Инициализируем экземпляр бота на верхнем уровне
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

function addMessageId(chatId, messageId) {
	messageIds.set(chatId, messageId)
}

function deletePreviousMessages(chatId, bot) {
	if (messageIds.has(chatId)) {
		const messageId = messageIds.get(chatId)
		bot
			.deleteMessage(chatId, messageId)
			.catch(error => console.error('Error deleting message', error.toString()))
		messageIds.delete(chatId) // Удалите ID из Map после удаления сообщения
	}
}

const stop10Message = `🛑 **10 ШАГ - ОСТАНОВИСЬ!**

✅ [СДЕЛАЙ РАЗБОР](https://t.me/+3uwmhEs5IR42YzFi)

В помощь тебе чат по разбору с примерами 10 шага Группы Душа. 🫶🏽

Ты можешь сделать свой разбор в этом чате и/или поделиться своим опытом с другими. 
Твой опыт очень важен 🫶🏽

📌 *10 ШАГ предлагает продолжать проверку нашей жизни с нравственных позиций, делать личную инвентаризацию и продолжать исправлять те новые ошибки, которые мы делаем на своем пути.*

Мы стали жить по-новому, когда разобрались с прегрешениями нашего прошлого.
Мы вошли в мир Духа. Наша следующая задача - расти в понимании и повышать действенность наших усилий.

Это не приходит за один день.

Нужно продолжать это делать всю оставшуюся жизнь.

Любовь к другим и терпимость – это наше кредо.

🤖 /stop10 - Нажми команду бота в чат и сделай разбор

С любовью, 
Группа Душа ❤️`

const stop11Message = `🛑 *11 ШАГ - ОСТАНОВИСЬ!*

✅ *ТВОИ ДЕЙСТВИЯ:*

1️⃣ *Внутреннее действие:* 
Пауза - внимание внутрь себя (направь свой внутренний взор и концентрируйся в свой сердечный центр, прямо посередине груди… не спеши… нащупай «точку опоры», то есть, когда ты всем вниманием внутри себя)

2️⃣ Вопрос - обращение к ВС: 
«А как бы Ты хотел, чтобы я сейчас поступил(а)?»
(слушай свою совесть) 


3️⃣ *Внешнее действие:* 
Поступить по новому в своей жизни, основываясь на Духовных принципах.

4️⃣ Если есть сомнения, обратись за помощью и прими помощь** (спонсор, доверенный, выйти на группу, запросить обратную связь)

📌 *В помощь тебе.*

❇️ *Внутренние действия:* 
В течение дня, особенно, если не знаешь, как поступить, обращайся к ВС внутрь себя с просьбой подсказать правильную мысль и решение.

♻️ *Внешние действия:* 
В течение дня стараться применять новые принципы жизни во всех своих делах, просить и принимать помощь.

⚠️ Мы постоянно напоминаем себе, что мы больше не мним себя центром вселенной, смиренно повторяя каждый день: “Да исполню я волю Твою”. От этого уменьшается опасность возникновения волнений, страха, злобы, беспокойства, жалости к себе и совершения необдуманных поступков. Мы становимся гораздо более умелыми. Мы не так легко утомляемся, потому что не сжигаем бессмысленно энергию, как это было раньше, когда мы строили жизнь так, чтобы она устраивала только нас.

🔆 Ведь Бог (ВС) всегда был рядом, но не мог войти в нашу жизнь потому, что мы не позволяли ему. Теперь мы совершаем ежедневные простые действия, чтобы позволить.

🛜 «И Абонент снова находится в зоне действия сети!» АМИНЬ!

🤖 /stop11 - Нажми команду бота в чат и обратись к ВС   

С любовью, 
Группа Душа ❤️`

const rulesMessage = `❗️ПРАВИЛА ЧАТА ❗️

Чат создан для обмена опытом по разбору 10 шага программы «12 шагов» участников Группы Душа.

✅  Разрешено: 
1. делиться личным опытом разбора по 10 шагу
2. запросить опыт 10 шага на ситуацию 
3. поделиться личным опытом по запросу 

❌ Запрещено: 
1. переписываться 
2. комментировать чей-либо опыт
3. критиковать и давать оценку

❓ Вопросы Вы можете задавать в личные сообщения автора сообщений.

⚠️ Любая переписка будет удалена админом чата. 
Просьба не воспринимать это, как личное оскорбление. 

⚠️ Пожалуйста, соблюдайте предназначение и чистоту чата. 
Спасибо 🙏🏼 

Возьмите то, что вам подходит и отбросьте всё остальное ❤️`

module.exports = async (request, response) => {
	try {
		const { body } = request

		if (body.message) {
			const {
				message_id,
				chat: { id },
				text,
			} = body.message

			if (['/stop10', '/stop11'].includes(text)) {
				// Сначала удаляем предыдущее сообщение, если оно есть
				deletePreviousMessages(id, bot)

				// Затем отправляем новое сообщение
				const messageToSend = text === '/stop10' ? stop10Message : stop11Message
				await bot
					.sendMessage(id, messageToSend, { parse_mode: 'Markdown' })
					.then(sentMessage => {
						addMessageId(id, sentMessage.message_id) // Добавляем ID нового сообщения
					})
					.catch(error => console.error('Error sending message', error.toString()))
			}

			if (isCommand(text)) {
				deletePreviousMessages(id, bot)
			}

			// В обработчике команд
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
					.sendMessage(id, stop10Message, {
						parse_mode: 'Markdown',
						disable_web_page_preview: true,
					})
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
