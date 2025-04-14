const { Bot } = require("grammy");
const axios = require("axios");
const {commandsForBotMenu} = require("./comands");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const STACK_EXCHANGE_KEY = process.env.STACK_EXCHANGE_KEY;

// Инициализация бота
const bot = new Bot(BOT_TOKEN);

// Команда /start
bot.api.setMyCommands(commandsForBotMenu)

bot.command("start", async (ctx) => {
    await ctx.reply(
        "👋 Привет! Я бот-программист. Задай мне вопрос, и я найду ответ на Stack Overflow. Пример: «How to sort an array in Java Script»"
    );
});

bot.command("about_bot", async (ctx) => {
    await ctx.reply(
        "Ищу ответы на StackOverflow"
    );
});

// Обработка текстовых сообщений
bot.on("message:text", async (ctx) => {
    const query = ctx.message.text;
    try {
        await ctx.reply("Await");
        const answer = await searchStackOverflow(query);
        await ctx.reply(answer, { parse_mode: "HTML" });
    } catch (error) {
        console.error(error);
        await ctx.reply("⚠️ Ошибка при поиске ответа. Попробуйте позже.");
    }
});

// Поиск на Stack Overflow
async function searchStackOverflow(query) {
    const url = "https://api.stackexchange.com/2.3/search/advanced";
    const params = {
        order: "desc",
        sort: "relevance",
        q: query,
        site: "stackoverflow",
        answers: 1, // Только вопросы с ответами
        key: STACK_EXCHANGE_KEY,
    };

    const response = await axios.get(url, { params });
    const items = response.data.items;

    if (!items || items.length === 0) {
        return "🔍 Ничего не найдено. Попробуйте уточнить вопрос.";
    }

    const topQuestion = items[0];
    return (
        `<b>Вопрос:</b> ${topQuestion.title}\n\n` +
        `<b>Лучший ответ:</b> <a href="${topQuestion.link}">Открыть на Stack Overflow</a>\n\n` +
        `🔹 Ответов: ${topQuestion.answer_count}\n` +
        `🔹 Рейтинг: ${topQuestion.score}`
    );
}

// Запуск бота
bot.start();
console.log("Бот запущен...");