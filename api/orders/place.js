import { getDb, requireUser, sendError } from '../_lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { getPriceBoard } from '../_lib/vnstockClient.js';

function toVnd(n) {
  return typeof n === 'number' ? Math.round(n * 1000) : n;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    const decoded = await requireUser(req);
    const db = getDb();

    const userSnap = await db.collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) { res.status(404).json({ ok: false, error: 'Chưa có hồ sơ tài khoản.' }); return; }
    const profile = userSnap.data();
    if (profile.banned) { res.status(403).json({ ok: false, error: 'Tài khoản đã bị tạm khoá.' }); return; }

    const body = req.body || {};
    const symbol = String(body.symbol || '').trim().toUpperCase();
    const side = body.side === 'SELL' ? 'SELL' : 'BUY';
    const type = body.type === 'LIMIT' ? 'LIMIT' : 'MARKET';
    const qty = Math.floor(Number(body.qty) || 0);
    const limitPrice = Number(body.price) || 0;

    if (!symbol || qty <= 0) { res.status(400).json({ ok: false, error: 'Thông tin lệnh không hợp lệ.' }); return; }
    if (qty % 100 !== 0) { res.status(400).json({ ok: false, error: 'Khối lượng đặt lệnh phải là bội số của 100 (1 lô).' }); return; }

    const haltedSnap = await db.collection('marketControl').doc('halted').get();
    const halted = haltedSnap.exists ? haltedSnap.data() : {};
    if (halted[symbol]) { res.status(400).json({ ok: false, error: `Mã ${symbol} đang bị tạm dừng giao dịch bởi quản trị viên.` }); return; }

    // Fetch the real, current market price server-side — never trust a price sent by the client.
    const board = await getPriceBoard(symbol);
    if (!board) { res.status(502).json({ ok: false, error: `Không lấy được giá thị trường cho mã ${symbol}.` }); return; }
    const marketPrice = toVnd(board.price);
    const ceiling = toVnd(board.ceilingPrice);
    const floor = toVnd(board.floorPrice);

    let execPrice = marketPrice;
    if (type === 'LIMIT') {
      if (!limitPrice || limitPrice < floor || limitPrice > ceiling) {
        res.status(400).json({ ok: false, error: `Giá đặt phải trong khoảng ${floor.toLocaleString('vi-VN')}₫ – ${ceiling.toLocaleString('vi-VN')}₫.` });
        return;
      }
      const matchable = side === 'BUY' ? limitPrice >= marketPrice : limitPrice <= marketPrice;
      if (!matchable) {
        res.status(409).json({
          ok: false,
          error: `Lệnh chưa khớp: giá thị trường hiện tại là ${marketPrice.toLocaleString('vi-VN')}₫. Đây là mô phỏng khớp lệnh tức thời — vui lòng đặt giá khớp ngay hoặc dùng lệnh Thị trường (MARKET).`,
        });
        return;
      }
      execPrice = side === 'BUY' ? Math.min(limitPrice, marketPrice) : Math.max(limitPrice, marketPrice);
    }

    const walletRef = db.collection('wallets').doc(decoded.uid);
    const holdingRef = db.collection('holdings').doc(decoded.uid).collection('positions').doc(symbol);
    const orderRef = db.collection('orders').doc();

    const result = await db.runTransaction(async (tx) => {
      const [walletSnap, holdingSnap] = await Promise.all([tx.get(walletRef), tx.get(holdingRef)]);
      const cashBalance = walletSnap.exists ? walletSnap.data().cashBalance || 0 : 0;
      const holding = holdingSnap.exists ? holdingSnap.data() : { qty: 0, avgCost: 0 };
      const orderValue = qty * execPrice;

      if (side === 'BUY') {
        if (orderValue > cashBalance) throw Object.assign(new Error('Số dư tiền mặt không đủ để đặt lệnh.'), { statusCode: 400 });
        const newQty = holding.qty + qty;
        const newAvgCost = newQty ? (holding.avgCost * holding.qty + orderValue) / newQty : 0;
        tx.set(walletRef, { cashBalance: cashBalance - orderValue, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        tx.set(holdingRef, { qty: newQty, avgCost: newAvgCost }, { merge: true });
      } else {
        if (qty > holding.qty) throw Object.assign(new Error('Khối lượng bán vượt quá số lượng sở hữu.'), { statusCode: 400 });
        const newQty = holding.qty - qty;
        tx.set(walletRef, { cashBalance: cashBalance + orderValue, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        tx.set(holdingRef, { qty: newQty, avgCost: newQty > 0 ? holding.avgCost : 0 }, { merge: true });
      }

      tx.set(orderRef, {
        uid: decoded.uid,
        email: decoded.email || '',
        symbol, side, type, qty,
        price: execPrice,
        status: 'matched',
        createdAt: FieldValue.serverTimestamp(),
        matchedAt: FieldValue.serverTimestamp(),
      });

      return { cashBalance: side === 'BUY' ? cashBalance - orderValue : cashBalance + orderValue };
    });

    res.status(200).json({ ok: true, orderId: orderRef.id, execPrice, cashBalance: result.cashBalance });
  } catch (err) {
    sendError(res, err);
  }
}
