// db-adapter.cjs — Adapter MySQL untuk server.ts
// Interface sama kayak savePersistentDataToDisk / loadPersistentDataFromDisk
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'apistudio',
  password: process.env.DB_PASS || 'baniw_2208_banziraxyszs',
  database: process.env.DB_NAME || 'apistudio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  charset: 'utf8mb4'
});

function toMySQLDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ============ LOAD ============
async function loadAll() {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    const [apiKeys] = await pool.query('SELECT * FROM api_keys_table');
    const [mockRoutes] = await pool.query('SELECT * FROM mock_routes');
    const [pricingPlans] = await pool.query('SELECT * FROM pricing_plans');
    const [configRows] = await pool.query('SELECT `key`, value FROM app_config');

    const config = {};
    for (const row of configRows) config[row.key] = row.value;

    // Convert dari snake_case MySQL ke camelCase JSON
    const usersArr = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      tier: u.tier,
      company: u.company,
      password: u.password,
      subscriptionExpiresAt: u.subscription_expires_at,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at
    }));

    const apiKeysArr = apiKeys.map(k => ({
      key: k.key,
      name: k.name,
      tier: k.tier,
      rateLimit: k.rate_limit,
      requestCount: k.request_count,
      totalLimit: k.total_limit,
      ownerEmail: k.owner_email,
      createdAt: k.created_at,
      lastUsedAt: k.last_used_at
    }));

    const mockRoutesArr = mockRoutes.map(m => ({
      id: m.id,
      path: m.path,
      method: m.method,
      status: m.status,
      delayMs: m.delay_ms,
      responseBody: typeof m.response_body === 'string' ? JSON.parse(m.response_body) : m.response_body,
      createdAt: m.created_at
    }));

    const pricingPlansArr = pricingPlans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      period: p.period,
      rateLimit: p.rate_limit,
      totalLimit: p.total_limit,
      description: p.description,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      isDefault: !!p.is_default,
      badgeColor: p.badge_color,
      createdAt: p.created_at
    }));

    return {
      version: config.version || '2.4.0',
      timestamp: config.last_saved_at || new Date().toISOString(),
      users: usersArr,
      apiKeys: apiKeysArr,
      mockRoutes: mockRoutesArr,
      pricingPlans: pricingPlansArr
    };
  } catch (e) {
    console.error('[MySQL Adapter] Load failed:', e.message);
    return null;
  }
}

// ============ SAVE ============
async function saveAll(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // USERS
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await conn.query(
          `INSERT INTO users (id, name, email, role, avatar, tier, company, password, subscription_expires_at, created_at, last_login_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name), role=VALUES(role), avatar=VALUES(avatar), tier=VALUES(tier),
             company=VALUES(company), password=VALUES(password),
             subscription_expires_at=VALUES(subscription_expires_at),
             created_at=VALUES(created_at), last_login_at=VALUES(last_login_at)`,
          [u.id, u.name, u.email, u.role, u.avatar || null, u.tier, u.company || null,
           u.password || null, toMySQLDate(u.subscriptionExpiresAt),
           toMySQLDate(u.createdAt), toMySQLDate(u.lastLoginAt)]
        );
      }
    }

    // API KEYS
    if (Array.isArray(data.apiKeys)) {
      for (const k of data.apiKeys) {
        await conn.query(
          `INSERT INTO api_keys_table (\`key\`, name, tier, rate_limit, request_count, total_limit, owner_email, created_at, last_used_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name), tier=VALUES(tier), rate_limit=VALUES(rate_limit),
             request_count=VALUES(request_count), total_limit=VALUES(total_limit),
             owner_email=VALUES(owner_email), created_at=VALUES(created_at), last_used_at=VALUES(last_used_at)`,
          [k.key, k.name, k.tier, k.rateLimit, k.requestCount || 0, k.totalLimit,
           k.ownerEmail, toMySQLDate(k.createdAt), toMySQLDate(k.lastUsedAt)]
        );
      }
    }

    // MOCK ROUTES
    if (Array.isArray(data.mockRoutes)) {
      for (const m of data.mockRoutes) {
        await conn.query(
          `INSERT INTO mock_routes (id, path, method, status, delay_ms, response_body, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             path=VALUES(path), method=VALUES(method), status=VALUES(status),
             delay_ms=VALUES(delay_ms), response_body=VALUES(response_body), created_at=VALUES(created_at)`,
          [m.id, m.path, m.method, m.status, m.delayMs || 0,
           JSON.stringify(m.responseBody), toMySQLDate(m.createdAt)]
        );
      }
    }

    // PRICING PLANS
    if (Array.isArray(data.pricingPlans)) {
      for (const p of data.pricingPlans) {
        await conn.query(
          `INSERT INTO pricing_plans (id, name, price, period, rate_limit, total_limit, description, features, is_default, badge_color, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name), price=VALUES(price), period=VALUES(period),
             rate_limit=VALUES(rate_limit), total_limit=VALUES(total_limit),
             description=VALUES(description), features=VALUES(features),
             is_default=VALUES(is_default), badge_color=VALUES(badge_color), created_at=VALUES(created_at)`,
          [p.id, p.name, p.price, p.period, p.rateLimit, p.totalLimit, p.description,
           JSON.stringify(p.features), p.isDefault ? 1 : 0, p.badgeColor || null,
           toMySQLDate(p.createdAt)]
        );
      }
    }

    // CONFIG
    await conn.query(
      'INSERT INTO app_config (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value=VALUES(value)',
      ['last_saved_at', new Date().toISOString()]
    );

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    console.error('[MySQL Adapter] Save failed:', e.message);
    return false;
  } finally {
    conn.release();
  }
}

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { loadAll, saveAll, testConnection, pool };
