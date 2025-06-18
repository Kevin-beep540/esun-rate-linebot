import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://www.esunbank.com.tw/bank/personal/foreign-exchange/exchange-rate');
    const $ = cheerio.load(response.data);
    const rates = [];
    $('table tbody tr').each((i, elem) => {
      const tds = $(elem).find('td');
      const currency = $(tds[0]).text().trim();
      const cashBuy = $(tds[1]).text().trim();
      const cashSell = $(tds[2]).text().trim();
      if (currency && cashBuy && cashSell) {
        rates.push({ currency, cashBuy, cashSell });
      }
    });
    res.status(200).json(rates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '無法取得匯率資料，請稍後再試' });
  }
}
