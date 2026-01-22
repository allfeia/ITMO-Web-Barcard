import { Telegraf } from "telegraf";
import "dotenv/config";

let bot;

export function getBot() {
  if (bot) return bot;

  const token = process.env.TG_BOT_TOKEN;
  if (!token) throw new Error("TG_BOT_TOKEN is missing in env");

  bot = new Telegraf(token);

  bot.start((ctx) =>
    ctx.reply(
      "Бот активен. Добавьте меня в группу бара и выполните /chatid чтобы узнать chat id.",
    ),
  );

  bot.command("chatid", async (ctx) => {
    await ctx.reply(`chat_id: ${ctx.chat?.id}`);
  });

  if (process.env.TG_BOT_POLLING === "true") {
    console.log("TG polling enabled, launching bot...");
    bot.launch();
    console.log("Bot launched");

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  }

  return bot;
}

export async function sendOrderToChat({ chatId, text }) {
  const b = getBot();
  return b.telegram.sendMessage(chatId, text, { disable_web_page_preview: true });
}