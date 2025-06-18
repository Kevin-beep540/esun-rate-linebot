import axios from 'axios';

export default async function handler(req, res) {
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';

  const CURRENCY_ALIAS = {
    "美元": ["美元", "美金"],
    "日圓": ["日圓", "日元"],
    "人民幣": ["人民幣", "RMB"],
    "港幣": ["港幣", "港元"],
    "英鎊": ["英鎊", "英磅"],
    "澳幣": ["澳幣", "澳元"],
    "加幣": ["加幣", "加元"],
    "歐元": ["歐元"],
    "新加坡幣": ["新加坡幣", "新幣"],
    "瑞士法郎": ["瑞士法郎"]
  };

  if (req.method === 'POST') {
    const events = req.body.events;

    for (const event of events) {
      const replyToken = event.replyToken;
      const userMessage = event.message.text.trim();

      let replyText = '';

      if (userMessage === '匯率') {
        replyText = `請問要查詢哪個幣值？請輸入以下任一幣值：${Object.keys(CURRENCY_ALIAS).join('、')}`;
      } else {
        let matchedCurrency = null;
        for (const [key, aliases] of Object.entries(CURRENCY_ALIAS)) {
          if (aliases.includes(userMessage)) {
            matchedCurrency = key;
            break;
          }
        }

        if (matchedCurrency) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rate`);
          const rates = response.data;
          const rate = rates.find(r => r.currency.includes(matchedCurrency));
          if (rate) {
            replyText = `${matchedCurrency} ➡️ 現金買入：${rate.cashBuy} / 現金賣出：${rate.cashSell}`;
          } else {
            replyText = '目前查無該幣值，請稍後再試';
          }
        } else {
          replyText = '查無此幣值，請重新輸入';
        }
      }

      await axios.post(REPLY_URL, {
        replyToken: replyToken,
        messages: [{ type: 'text', text: replyText }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      });
    }

    res.status(200).end();
  } else {
    res.status(405).end();
  }
}
