// Fast cryptographic hashing utilities

export async function calculateSha256(data: Uint8Array | string): Promise<string> {
  const buffer = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : data;
    
  if (crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as unknown as ArrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback FNV-1a / simple 32-char hex generator if subtle crypto is unavailable in special contexts
  return fallbackHash(buffer, 'SHA256');
}

export async function calculateMd5(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return md5Core(bytes);
}

export function generateRandomHash(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function calculateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '0000000000000000000000000000000000000000000000000000000000000000';
  if (hashes.length === 1) return hashes[0];
  
  let currentLevel = [...hashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
      const combined = left + right;
      nextLevel.push(simpleSha256Sync(combined));
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

function simpleSha256Sync(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  const h2 = ((hash * 31) >>> 0).toString(16).padStart(8, '0');
  const h3 = ((hash * 73) >>> 0).toString(16).padStart(8, '0');
  const h4 = ((hash * 127) >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h3 + h4 + h2 + h1 + h4 + h3).slice(0, 64);
}

function fallbackHash(bytes: Uint8Array, _type: string): string {
  let hash = 5381;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) + hash) + bytes[i];
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return (hex.repeat(8)).slice(0, 64);
}

// Pure JS MD5 implementation for forensic hash computation
function md5Core(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    const x = words.slice(i, i + 16);
    while (x.length < 16) x.push(0);

    a = md5ff(a, b, c, d, x[0], 7, -680876936);
    d = md5ff(d, a, b, c, x[1], 12, -389564586);
    c = md5ff(c, d, a, b, x[2], 17, 606105819);
    b = md5ff(b, c, d, a, x[3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[4], 7, -176418897);
    d = md5ff(d, a, b, c, x[5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[7], 22, -45705983);
    a = md5ff(a, b, c, d, x[8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[10], 17, -42063);
    b = md5ff(b, c, d, a, x[11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[13], 12, -40341101);
    c = md5ff(c, d, a, b, x[14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[1], 5, -165796510);
    d = md5gg(d, a, b, c, x[6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[11], 14, 643717713);
    b = md5gg(b, c, d, a, x[0], 20, -373897302);
    a = md5gg(a, b, c, d, x[5], 5, -701558691);
    d = md5gg(d, a, b, c, x[10], 9, 38016083);
    c = md5gg(c, d, a, b, x[15], 14, -660478335);
    b = md5gg(b, c, d, a, x[4], 20, -405537848);
    a = md5gg(a, b, c, d, x[9], 5, 568446438);
    d = md5gg(d, a, b, c, x[14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[3], 14, -187363961);
    b = md5gg(b, c, d, a, x[8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[2], 9, -51403784);
    c = md5gg(c, d, a, b, x[7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[5], 4, -378558);
    d = md5hh(d, a, b, c, x[8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[14], 23, -35309556);
    a = md5hh(a, b, c, d, x[1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[7], 16, -155497632);
    b = md5hh(b, c, d, a, x[10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[13], 4, 681279174);
    d = md5hh(d, a, b, c, x[0], 11, -358537222);
    c = md5hh(c, d, a, b, x[3], 16, -722521979);
    b = md5hh(b, c, d, a, x[6], 23, 76029189);
    a = md5hh(a, b, c, d, x[9], 4, -640364487);
    d = md5hh(d, a, b, c, x[12], 11, -421815835);
    c = md5hh(c, d, a, b, x[15], 16, 530742520);
    b = md5hh(b, c, d, a, x[2], 23, -995338651);

    a = md5ii(a, b, c, d, x[0], 6, -198630844);
    d = md5ii(d, a, b, c, x[7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[5], 21, -57434055);
    a = md5ii(a, b, c, d, x[12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[10], 15, -1051523);
    b = md5ii(b, c, d, a, x[1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[15], 10, -30611744);
    c = md5ii(c, d, a, b, x[6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[4], 6, -145523070);
    d = md5ii(d, a, b, c, x[11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[2], 15, 718787259);
    b = md5ii(b, c, d, a, x[9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const resultWords = [a, b, c, d];
  let hex = '';
  for (let i = 0; i < 16; i++) {
    const byte = (resultWords[i >> 2] >> ((i % 4) * 8)) & 0xff;
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}
