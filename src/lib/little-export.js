import CBOR from "./cbor-x.js";

const TYPE = { OPFS: 1, IDB: 2, LS: 4, SS: 8, COOKIE: 16, CACHE: 32 };
const DECISION = { SKIP: 0, PROCESS: 1, TRUST: 2, ABORT: 3 };

function createYielder(threshold = 100) {
  // Testing has shown that Chromium's performance.now() is worst-case slower than all other browsers (but can still be called millions of times per second). Date.now() Browsers like Firefox actually have performance.now() over 10x faster than Date.now(), upwards of hundreds of millions of checks per second. However, this shouldn't really matter too much here as yielding is not checked often enough for this to add up significantly.
  let lastYield = 0;
  let inflight = null;

  const channel = new MessageChannel();
  const resolvers = [];
  channel.port1.onmessage = () => resolvers.shift()?.();

  async function doYield() {
    if ("scheduler" in window && "yield" in scheduler) {
      await scheduler.yield();
    } else {
      await new Promise((res) => {
        resolvers.push(res);
        channel.port2.postMessage(null);
      });
    }
    lastYield = Date.now();
    inflight = null;
  }

  return function (force = false) {
    const now = Date.now();
    if (!force && now - lastYield <= threshold) return null;
    if (!inflight) inflight = doYield();
    return inflight;
  };
}

const CHUNK_SIZE = 4194304;
const TAR_BUFFER_SIZE = 65536;
const ENC = new TextEncoder();
const DEC = new TextDecoder("utf-8", { fatal: false });

// A blob at or below this size goes in the CBOR record. A larger blob gets its own archive entry and stays in a stream, thus the memory use does not increase with the size of the blob. Set inlineBlobLimit in the options to change this value.
const INLINE_BLOB_LIMIT = 8388608; // 8 MiB
// The memory fallback collects the archive in Blob parts of this size. The browser can put Blob data on the disk, but a JS array stays in the heap.
const BLOB_PART_SIZE = 8388608; // 8 MiB
let blobIdCounter = 0;

async function deriveKey(password, salt) {
  const km = await crypto.subtle.importKey(
    "raw",
    ENC.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Simple mode filter, supports functions and arrays
function checkSimpleFilter(category, pathStr, config) {
  const { include, exclude } = config;

  // Check exclude first (blacklist)
  if (exclude && exclude[category]) {
    const filter = exclude[category];
    if (typeof filter === "function") {
      if (filter(pathStr)) return false;
    } else if (Array.isArray(filter)) {
      // Either exact match or directory prefix match
      if (filter.some((t) => pathStr === t || pathStr.startsWith(t + "/")))
        return false;
    }
  }

  // Check include (whitelist), only if specified
  if (include && include[category]) {
    const filter = include[category];
    if (typeof filter === "function") {
      return filter(pathStr);
    } else if (Array.isArray(filter) && filter.length > 0) {
      return filter.some((t) => pathStr === t || pathStr.startsWith(t + "/"));
    }
  }

  return true;
}

// All access of this function will be from LittleExport.prepForCBOR to allow for customization.
// The walk stays synchronous. Each blob becomes a holder object, and prepareForCBOR then puts the bytes in the holder.
function prepForCBOR(
  item,
  pendingBlobs,
  seen = new WeakMap(),
  blobMap = new Map(),
) {
  if (!item || typeof item !== "object") return item;

  if (
    item instanceof ArrayBuffer ||
    ArrayBuffer.isView(item) ||
    item instanceof Date
  ) {
    return item;
  }

  if (seen.has(item)) return seen.get(item);

  if (item instanceof Blob) {
    if (blobMap.has(item)) {
      return blobMap.get(item);
    }

    // The bytes stay in the record. A File also keeps its name and its time.
    const ref = { __le_blob: null, type: item.type };
    if (typeof item.name === "string") {
      ref.name = item.name;
      ref.lastModified = item.lastModified;
    }

    pendingBlobs.push({ ref, blob: item });
    blobMap.set(item, ref);
    return ref;
  }

  let res;

  // cbor-x writes RegExp and Error objects with tags. A usual object walk makes them empty, thus keep them as they are.
  if (item instanceof RegExp || item instanceof Error) return item;

  if (item instanceof Map) {
    res = new Map();
    seen.set(item, res);
    for (const [k, v] of item) {
      res.set(
        LittleExport.prepForCBOR(k, pendingBlobs, seen, blobMap),
        LittleExport.prepForCBOR(v, pendingBlobs, seen, blobMap),
      );
    }
    return res;
  }

  if (item instanceof Set) {
    res = new Set();
    seen.set(item, res);
    for (const v of item) {
      res.add(LittleExport.prepForCBOR(v, pendingBlobs, seen, blobMap));
    }
    return res;
  }

  if (Array.isArray(item)) {
    const keys = Object.keys(item);
    const isSparse = keys.length < item.length || keys.some((k) => isNaN(k));

    if (isSparse) {
      res = { __le_sparse: true, length: item.length, data: {} };
      seen.set(item, res);
      for (const k of keys) {
        res.data[k] = LittleExport.prepForCBOR(
          item[k],
          pendingBlobs,
          seen,
          blobMap,
        );
      }
    } else {
      res = new Array(item.length);
      seen.set(item, res);
      for (let i = 0; i < item.length; i++) {
        res[i] = LittleExport.prepForCBOR(item[i], pendingBlobs, seen, blobMap);
      }
    }
  } else {
    res = {};
    seen.set(item, res);
    for (const k in item) {
      if (Object.prototype.hasOwnProperty.call(item, k)) {
        res[k] = LittleExport.prepForCBOR(item[k], pendingBlobs, seen, blobMap);
      }
    }
  }

  return res;
}

// Walk a value, then give each blob its final form. A small blob keeps its bytes in the record. A large blob becomes a reference, and the caller must write it to the archive before the record.
// Gives { value, external }, where external holds the large blobs to write.
async function prepareForCBOR(item, inlineLimit = INLINE_BLOB_LIMIT) {
  const pendingBlobs = [];
  const value = LittleExport.prepForCBOR(item, pendingBlobs);
  const external = [];
  const inline = [];

  for (const p of pendingBlobs) {
    if (p.blob.size <= inlineLimit) {
      inline.push(p);
    } else {
      const id = (blobIdCounter++).toString(36);
      delete p.ref.__le_blob;
      p.ref.__le_blob_ref = id;
      p.ref.size = p.blob.size;
      external.push({ id, blob: p.blob });
    }
  }

  // Read the small blobs together. Only these blobs come into memory.
  if (inline.length > 0) {
    const buffers = await Promise.all(inline.map((p) => p.blob.arrayBuffer()));
    for (let i = 0; i < inline.length; i++) {
      inline[i].ref.__le_blob = new Uint8Array(buffers[i]);
    }
  }

  return { value, external };
}

// This function stays synchronous. The small blobs are in the record, and the importer opens the large blobs before it calls this function. blobStore maps an ID to a File on the disk.
// The seen map keeps circular data safe. Put each new container in the map before you fill it.
function restoreFromCBOR(item, blobStore = null, seen = new WeakMap()) {
  if (!item || typeof item !== "object") return item;
  if (seen.has(item)) return seen.get(item);

  // A large blob stays on the disk. A slice of a File makes no copy of the bytes.
  if (item.__le_blob_ref !== undefined) {
    const source = blobStore ? blobStore.get(item.__le_blob_ref) : null;
    if (!source) return null;

    const part = source.slice(0, source.size, item.type);
    const out =
      item.name !== undefined
        ? new File([part], item.name, {
            type: item.type,
            lastModified: item.lastModified,
          })
        : part;
    seen.set(item, out);
    return out;
  }

  if (item.__le_blob !== undefined) {
    const bytes = item.__le_blob || new Uint8Array(0);
    const blob =
      item.name !== undefined
        ? new File([bytes], item.name, {
            type: item.type,
            lastModified: item.lastModified,
          })
        : new Blob([bytes], { type: item.type });
    seen.set(item, blob);
    return blob;
  }

  if (item.__le_sparse) {
    const arr = new Array(item.length);
    seen.set(item, arr);
    for (const k in item.data) {
      arr[k] = LittleExport.restoreFromCBOR(item.data[k], blobStore, seen);
    }
    return arr;
  }

  if (Array.isArray(item)) {
    const res = new Array(item.length);
    seen.set(item, res);
    for (let i = 0; i < item.length; i++) {
      res[i] = LittleExport.restoreFromCBOR(item[i], blobStore, seen);
    }
    return res;
  }

  // Maps and Sets can also contain blobs.
  if (item instanceof Map) {
    const res = new Map();
    seen.set(item, res);
    for (const [k, v] of item) {
      res.set(
        LittleExport.restoreFromCBOR(k, blobStore, seen),
        LittleExport.restoreFromCBOR(v, blobStore, seen),
      );
    }
    return res;
  }

  if (item instanceof Set) {
    const res = new Set();
    seen.set(item, res);
    for (const v of item) {
      res.add(LittleExport.restoreFromCBOR(v, blobStore, seen));
    }
    return res;
  }

  if (item.constructor === Object) {
    const n = {};
    seen.set(item, n);
    for (const k in item) {
      n[k] = LittleExport.restoreFromCBOR(item[k], blobStore, seen);
    }
    return n;
  }
  return item;
}

const TAR_CONSTANTS = {
  USTAR_MAGIC: new Uint8Array([117, 115, 116, 97, 114, 0]),
  USTAR_VER: new Uint8Array([48, 48]),
  EMPTY_SPACE: new Uint8Array(8).fill(32),
};

const HEADER_TEMPLATE = new Uint8Array(512);
(function initTemplate() {
  const w = (str, off) => ENC.encodeInto(str, HEADER_TEMPLATE.subarray(off));
  w("000644 \0", 100);
  w("000000 \0", 108);
  w("000000 \0", 116);
  HEADER_TEMPLATE.set(TAR_CONSTANTS.EMPTY_SPACE, 148);
  HEADER_TEMPLATE[156] = 48;
  HEADER_TEMPLATE.set(TAR_CONSTANTS.USTAR_MAGIC, 257);
  HEADER_TEMPLATE.set(TAR_CONSTANTS.USTAR_VER, 263);
})();

function createPaxData(path, size) {
  const encoder = new TextEncoder();
  let content = new Uint8Array(0);

  const addRecord = (keyword, value) => {
    if (value == null) return;
    const strVal = String(value);
    // Format: "length keyword=value\n"
    const suffix = ` ${keyword}=${strVal}\n`;
    const suffixBytes = encoder.encode(suffix);

    // Calculate total length (bytes of length string + space + bytes of suffix)
    let total = suffixBytes.length;
    let lenStr = String(total);

    // Adjust length until it stabilizes (since going from length 9 to 10 adds a digit)
    while (true) {
      const newTotal = suffixBytes.length + lenStr.length;
      if (newTotal === total) break;
      total = newTotal;
      lenStr = String(total);
    }

    const line = encoder.encode(`${lenStr}${suffix}`);
    const newContent = new Uint8Array(content.length + line.length);
    newContent.set(content);
    newContent.set(line, content.length);
    content = newContent;
  };

  addRecord("path", path);
  if (size > 8589934591) {
    addRecord("size", size);
  }

  return content;
}

function createTarHeader(filename, size, time, type = "0", mode = "000644") {
  const safeSize = size > 8589934591 ? 0 : size;
  const buffer = HEADER_TEMPLATE.slice(0);

  // 0=file, 5=dir, x=pax
  buffer[156] = type.charCodeAt(0);

  // Write filename
  const nameBytes = ENC.encode(filename);
  const copyLen = Math.min(nameBytes.length, 100);
  buffer.set(nameBytes.subarray(0, copyLen), 0);

  if (mode) {
    ENC.encodeInto(mode.padEnd(7, "\0"), buffer.subarray(100, 108));
  }

  const writeOctal = (num, offset, len) => {
    const str = Math.floor(num)
      .toString(8)
      .padStart(len - 1, "0");
    if (str.length >= len) {
      LittleExport.warn(
        "PAX attempted to write octal that was too long (due to either sizes or timestamp).",
      );
      return;
    }
    ENC.encodeInto(str, buffer.subarray(offset, offset + len - 1));
    buffer[offset + len - 1] = 0; // Space/null termination
  };

  writeOctal(safeSize, 124, 12);
  writeOctal(time, 136, 12);

  let sum = 0;
  for (let i = 0; i < 512; i++) {
    sum += buffer[i];
  }

  const cksumStr = sum.toString(8).padStart(6, "0");
  ENC.encodeInto(cksumStr, buffer.subarray(148));
  buffer[154] = 0;
  buffer[155] = 32;

  return buffer;
}

class TarWriter {
  constructor(writableStream, yielder) {
    this.writer = writableStream.getWriter();
    this.yielder = yielder;
    this.pos = 0;
    this.time = Math.floor(Date.now() / 1000);
    this.paxCounter = 0;
    this.buffer = new Uint8Array(TAR_BUFFER_SIZE);
    this.bufferOffset = 0;
  }

  async writeEntry(path, data) {
    const bytes = typeof data === "string" ? ENC.encode(data) : data;
    const size = bytes.byteLength;
    if (this.onFileProgress) this.onFileProgress(0, size);
    await this.smartWrite(path, size, async () => {
      await this.write(bytes);
    });

    if (this.onFileProgress) this.onFileProgress(size, size);
  }

  async writeStream(path, size, readableStream) {
    let contentWritten = 0;
    await this.flush();
    await this.smartWrite(path, size, async () => {
      const reader = readableStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const remaining = size - contentWritten;
            if (remaining <= 0) {
              continue;
            }

            const toWrite =
              value.byteLength > remaining
                ? value.subarray(0, remaining)
                : value;
            await this.write(toWrite);
            contentWritten += toWrite.byteLength;

            if (this.onFileProgress) this.onFileProgress(contentWritten, size);
          }
          const p = this.yielder();
          if (p) await p;
        }

        if (contentWritten < size) {
          const missing = size - contentWritten;
          const zeros = new Uint8Array(missing);
          await this.write(zeros);
        }
      } finally {
        reader.releaseLock();
      }
    });
  }

  async smartWrite(path, size, contentFn) {
    const pathBytes = ENC.encode(path);
    const needsPax = pathBytes.length > 100 || size > 8589934591;

    if (needsPax) {
      const paxData = createPaxData(path, size); // Already handles encoding internally
      // Readers do not use the name of a PAX header. A counter keeps the name short ASCII, thus a long name with multibyte characters cannot be cut in the middle of a character.
      const safePaxName = "PaxHeaders/" + this.paxCounter++;

      await this.write(
        createTarHeader(safePaxName, paxData.length, this.time, "x"),
      );
      await this.write(paxData);
      await this.pad();
    }

    await this.write(
      createTarHeader(
        path,
        size,
        this.time,
        size === 0 && path.endsWith("/") ? "5" : "0",
      ),
    );
    if (contentFn) await contentFn();
    await this.pad();
  }

  async writeDir(path) {
    // Ensure path ends with /
    if (!path.endsWith("/")) path += "/";

    // Inline PAX logic
    const pathBytes = ENC.encode(path);
    const needsPax = pathBytes.length > 100;

    if (needsPax) {
      const paxData = createPaxData(path, 0);
      // Readers do not use the name of a PAX header. A counter keeps the name short ASCII, thus a long name with multibyte characters cannot be cut in the middle of a character.
      const safePaxName = "PaxHeaders/" + this.paxCounter++;
      await this.write(
        createTarHeader(safePaxName, paxData.length, this.time, "x"),
      );
      await this.write(paxData);
      await this.pad();
    }

    const header = createTarHeader(path, 0, this.time, "5", "000755");
    await this.write(header);
  }

  async write(chunk) {
    const len = chunk.byteLength;
    if (len >= TAR_BUFFER_SIZE) {
      await this.flush();
      await this.writer.write(chunk);
    } else if (this.bufferOffset + len > TAR_BUFFER_SIZE) {
      await this.flush();
      this.buffer.set(chunk, 0);
      this.bufferOffset = len;
    } else {
      this.buffer.set(chunk, this.bufferOffset);
      this.bufferOffset += len;
    }

    this.pos += len;
  }

  async pad() {
    const padding = (512 - (this.pos % 512)) % 512;
    if (padding > 0) await this.write(new Uint8Array(padding));
  }

  async flush() {
    if (this.bufferOffset > 0) {
      await this.writer.write(this.buffer.slice(0, this.bufferOffset));
      this.bufferOffset = 0;
    }
  }

  async close() {
    await this.write(new Uint8Array(1024)); // EOF
    await this.flush();
    await this.writer.close();
  }
}

class EncryptionTransformer {
  constructor(password, salt) {
    this.salt = salt;
    this.keyPromise = deriveKey(password, salt);
    this.chunks = [];
    this.currentSize = 0;
  }

  async start(controller) {
    controller.enqueue(ENC.encode("LE_ENC"));
    controller.enqueue(this.salt);
    await this.encryptAndPush(
      new Uint8Array(0),
      controller,
      await this.keyPromise,
    );
  }

  async transform(chunk, controller) {
    this.chunks.push(chunk);
    this.currentSize += chunk.byteLength;

    if (this.currentSize >= CHUNK_SIZE) {
      const fullBuffer = new Uint8Array(this.currentSize);
      let offset = 0;
      for (const c of this.chunks) {
        fullBuffer.set(c, offset);
        offset += c.byteLength;
      }

      const key = await this.keyPromise;
      let pos = 0;
      while (pos + CHUNK_SIZE <= fullBuffer.length) {
        await this.encryptAndPush(
          fullBuffer.subarray(pos, pos + CHUNK_SIZE),
          controller,
          key,
        );
        pos += CHUNK_SIZE;
      }

      const remainder = fullBuffer.subarray(pos);
      this.chunks = remainder.length > 0 ? [remainder] : [];
      this.currentSize = remainder.length;
    }
  }

  async flush(controller) {
    if (this.currentSize > 0) {
      const finalBuffer = new Uint8Array(this.currentSize);
      let offset = 0;
      for (const c of this.chunks) {
        finalBuffer.set(c, offset);
        offset += c.byteLength;
      }
      await this.encryptAndPush(finalBuffer, controller, await this.keyPromise);
    }
  }

  async encryptAndPush(data, controller, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );
    const lenParams = new DataView(new ArrayBuffer(4));
    lenParams.setUint32(0, ciphertext.byteLength, true);
    controller.enqueue(iv);
    controller.enqueue(new Uint8Array(lenParams.buffer));
    controller.enqueue(new Uint8Array(ciphertext));
  }
}

class ChunkBuffer {
  constructor() {
    this.chunks = [];
    this.totalSize = 0;
    this.offset = 0; // Pointer to start of valid data in chunks[0]
  }

  push(chunk) {
    if (!chunk || chunk.byteLength === 0) return;
    this.chunks.push(chunk);
    this.totalSize += chunk.byteLength;
  }

  has(n) {
    return this.totalSize >= n;
  }

  _internalConsume(n, callback) {
    let consumed = 0;
    while (consumed < n && this.chunks.length > 0) {
      const chunk = this.chunks[0];
      const availableInChunk = chunk.byteLength - this.offset;
      const remainingNeeded = n - consumed;
      const toTake = Math.min(availableInChunk, remainingNeeded);

      callback(chunk.subarray(this.offset, this.offset + toTake));

      this.offset += toTake;
      if (this.offset >= chunk.byteLength) {
        this.chunks.shift();
        this.offset = 0;
      }

      this.totalSize -= toTake;
      consumed += toTake;
    }
  }

  // Remove data without a copy. Use this to move across the parts of the archive that you do not import.
  discard(n) {
    this._internalConsume(n, () => {});
  }

  read(n) {
    if (n === 0) return new Uint8Array(0);
    if (this.totalSize < n) throw new Error("Insufficient chunk data.");

    // Fast path: data is fully contained in the first chunk
    if (
      this.chunks.length > 0 &&
      this.chunks[0].byteLength - this.offset >= n
    ) {
      const res = this.chunks[0].subarray(this.offset, this.offset + n);
      this.offset += n;
      if (this.offset >= this.chunks[0].byteLength) {
        this.chunks.shift();
        this.offset = 0;
      }
      this.totalSize -= n;
      return res;
    }

    const result = new Uint8Array(n);
    let offset = 0;
    this._internalConsume(n, (seg) => {
      result.set(seg, offset);
      offset += seg.byteLength;
    });
    return result;
  }

  async consume(n, callback) {
    let remaining = n;
    while (remaining > 0 && this.chunks.length > 0) {
      const chunk = this.chunks[0];
      const availableInChunk = chunk.byteLength - this.offset;
      const toProcess = Math.min(availableInChunk, remaining);

      await callback(chunk.subarray(this.offset, this.offset + toProcess));

      this.offset += toProcess;
      if (this.offset >= chunk.byteLength) {
        this.chunks.shift();
        this.offset = 0;
      }

      this.totalSize -= toProcess;
      remaining -= toProcess;
    }
  }
}

class DecryptionSource {
  constructor(readableStream, password, yielder) {
    this.stream = readableStream;
    this.password = password;
    this.yielder = yielder;
    this.buffer = new ChunkBuffer();
  }

  readable() {
    const self = this;
    let reader;
    let key = null;
    let finished = false;

    // A block cannot be larger than the chunk size plus the tag. A larger value shows damaged data.
    const MAX_BLOCK_SIZE = CHUNK_SIZE + 4096;

    async function ensure(n) {
      while (!self.buffer.has(n)) {
        const { value, done } = await reader.read();
        if (done) return false;
        self.buffer.push(value);
      }
      return true;
    }

    function release() {
      finished = true;
      try {
        reader.releaseLock();
      } catch (err) {}
    }

    return new ReadableStream({
      async start(controller) {
        reader = self.stream.getReader();
        try {
          if (!(await ensure(22))) throw new Error("Not an encrypted archive.");
          const sig = DEC.decode(self.buffer.read(6));
          if (sig !== "LE_ENC") throw new Error("Not an encrypted archive.");

          const salt = self.buffer.read(16);
          key = await deriveKey(self.password, salt);

          if (!(await ensure(16))) throw new Error("Corrupt header.");
          const initIV = self.buffer.read(12);
          const initLenRaw = self.buffer.read(4);
          const initLen = new DataView(
            initLenRaw.buffer,
            initLenRaw.byteOffset,
            initLenRaw.byteLength,
          ).getUint32(0, true);

          if (initLen !== 16 || !(await ensure(initLen)))
            throw new Error("Corrupt header.");
          const initCipher = self.buffer.read(initLen);
          try {
            await crypto.subtle.decrypt(
              { name: "AES-GCM", iv: initIV },
              key,
              initCipher,
            );
          } catch (err) {
            throw new Error("Incorrect password or corrupt file.");
          }
        } catch (err) {
          release();
          controller.error(err);
        }
      },

      // Decrypt one block for each pull. The consumer controls the speed, thus the full archive does not go into memory.
      async pull(controller) {
        if (finished) return;

        try {
          while (!self.buffer.has(16)) {
            const { value, done } = await reader.read();
            if (done) {
              if (self.buffer.totalSize !== 0)
                throw new Error("Truncated encrypted stream.");
              release();
              controller.close();
              return;
            }
            self.buffer.push(value);
          }

          const iv = self.buffer.read(12);
          const lenRaw = self.buffer.read(4);
          const lenVal = new DataView(
            lenRaw.buffer,
            lenRaw.byteOffset,
            lenRaw.byteLength,
          ).getUint32(0, true);

          if (lenVal === 0 || lenVal > MAX_BLOCK_SIZE)
            throw new Error("Corrupt encrypted stream.");

          while (!self.buffer.has(lenVal)) {
            const { value, done } = await reader.read();
            if (done) throw new Error("Unexpected EOF in ciphertext.");
            self.buffer.push(value);
            const p2 = self.yielder();
            if (p2) await p2;
          }

          const cipher = self.buffer.read(lenVal);
          const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipher,
          );

          const p = self.yielder();
          if (p) await p;

          controller.enqueue(new Uint8Array(plain));
        } catch (err) {
          release();
          controller.error(err);
        }
      },

      cancel(reason) {
        finished = true;
        return reader.cancel(reason);
      },
    });
  }
}

function verifyChecksum(header) {
  const claimedStr = DEC.decode(header.slice(148, 156))
    .replace(/\0/g, "")
    .trim();
  const claimed = parseInt(claimedStr, 8);

  if (isNaN(claimed)) return false;

  let sum = 0;
  for (let i = 0; i < 512; i++) {
    // The 8 bytes at 148 must be treated as spaces (ASCII 32)
    if (i >= 148 && i < 156) sum += 32;
    else sum += header[i];
  }
  return sum === claimed;
}

async function exportData(config = {}) {
  blobIdCounter = 0;

  // Check the LittleExport docs on all the options.
  const opts = {
    fileName: "archive",
    logSpeed: 100,
    customItems: [],
    include: {}, // logic handled with checkSimpleFilter
    exclude: {},
    cborExtensionName: "cbor",
    ...config,
  };

  const inlineBlobLimit =
    opts.inlineBlobLimit === undefined
      ? INLINE_BLOB_LIMIT
      : opts.inlineBlobLimit;

  const encoder =
    opts.encoder ||
    new CBOR.Encoder({
      structuredClone: true, // Circular references may cause errors/problems if disabled.
      copyBuffers: false, // Free optimization of preventing copying of buffers (less memory use).
      bundleStrings: true, // Optimization for strings at the cost of inconsistency with the formal CBOR spec (and lack of explicit documentation in cbor-x to parse). See the LittleExport README for more information.
      ...opts.cborOptions,
    });

  const cborExtensionName = opts.cborExtensionName;
  const logger = opts.logger || (() => {});
  const yielder = createYielder(opts.logSpeed);
  const graceful = opts.graceful !== false;
  const useOnVisit = typeof opts.onVisit === "function";
  const onVisit = opts.onVisit;

  let aborted = false;

  function getDecision(type, path, meta) {
    if (!useOnVisit) return DECISION.PROCESS;
    return onVisit(type, path, meta);
  }

  async function tryGraceful(fn, context) {
    try {
      return await fn();
    } catch (err) {
      if (opts.onerror) opts.onerror(err);
      if (graceful) {
        logger(`Error: ${context} - ${err.message}`);
        return null;
      }
      throw err;
    }
  }

  const status = { category: "", detail: "" };

  let outputStream;

  // The memory fallback collects the archive in Blob parts. The bytes then leave the JS heap, and the browser can put them on the disk.
  const blobParts = [];
  let pendingParts = [];
  let pendingPartsSize = 0;
  const flushParts = () => {
    if (pendingParts.length === 0) return;
    blobParts.push(new Blob(pendingParts));
    pendingParts = [];
    pendingPartsSize = 0;
  };

  let fileName = opts.fileName.includes(".")
    ? opts.fileName
    : opts.password
      ? `${opts.fileName}.enc`
      : `${opts.fileName}.tar.gz`;
  if (window.showSaveFilePicker && opts.download !== false) {
    try {
      const name = fileName;
      const handle = await window.showSaveFilePicker({ suggestedName: name });
      outputStream = await handle.createWritable();
    } catch (err) {
      if (err.name === "AbortError") {
        logger("Export cancelled.");
        return;
      }
      LittleExport.warn("FileSystem picker failed, falling back.");
    }
  }

  if (!outputStream) {
    outputStream = new WritableStream({
      write(c) {
        pendingParts.push(c);
        pendingPartsSize += c.byteLength;
        if (pendingPartsSize >= BLOB_PART_SIZE) flushParts();
      },
      close() {
        flushParts();
      },
    });
  }

  let outputBytesWritten = 0;
  const countingStream = new TransformStream({
    async transform(chunk, controller) {
      outputBytesWritten += chunk.byteLength;
      const p = yielder();
      if (p) {
        if (status.category) {
          if (status.category === "Finishing") {
            logger("Finishing...");
          } else {
            let msg = `Exporting ${status.category}: ${(outputBytesWritten / 1e6).toFixed(2)} MB`;
            if (currentFileProgress.total > 1e6) {
              msg += ` (${status.detail}: ${(currentFileProgress.written / 1e6).toFixed(1)}/${(currentFileProgress.total / 1e6).toFixed(1)} MB)`;
            } else {
              msg += ` (${status.detail})`;
            }
            logger(msg);
          }
        }
        await p;
      }
      controller.enqueue(chunk);
    },
  });

  const gzip = new CompressionStream("gzip");
  let pipeline = gzip.readable;

  if (opts.password) {
    status.category = "Setup";
    status.detail = "Encrypting...";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    pipeline = pipeline.pipeThrough(
      new TransformStream(new EncryptionTransformer(opts.password, salt)),
    );
  }

  let currentFileProgress = { written: 0, total: 0 };
  const exportFinishedPromise = pipeline
    .pipeThrough(countingStream)
    .pipeTo(outputStream);
  const tar = new TarWriter(gzip.writable, yielder);
  tar.onFileProgress = (written, total) => {
    currentFileProgress.written = written;
    currentFileProgress.total = total;
  };

  try {
    // Custom items (always processed)
    for (const item of opts.customItems) {
      if (aborted) break;
      status.category = "custom";
      status.detail = item.path;
      const path = `data/custom/${item.path}`;
      if (item.data instanceof Blob) {
        await tar.writeStream(path, item.data.size, item.data.stream());
      } else {
        await tar.writeEntry(
          path,
          typeof item.data === "string" ? item.data : JSON.stringify(item.data),
        );
      }
    }

    // OPFS
    if (!aborted && opts.opfs !== false && navigator.storage) {
      let categoryDecision = getDecision(TYPE.OPFS);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "OPFS";
        const root = await navigator.storage.getDirectory();
        const trustAll = categoryDecision === DECISION.TRUST;

        async function walkOpfs(dir, pathArray, inherited) {
          try {
            for await (const entry of dir.values()) {
              if (aborted) return;
              currentFileProgress.written = 0;
              currentFileProgress.total = 0;

              const currentPath = [...pathArray, entry.name];
              const pathStr = currentPath.join("/");
              let decision = inherited;

              status.detail = pathStr;

              if (!inherited) {
                if (useOnVisit) {
                  let raw = getDecision(TYPE.OPFS, currentPath, {
                    kind: entry.kind,
                    handle: entry,
                  });
                  if (raw && typeof raw.then === "function") raw = await raw;
                  decision = raw;

                  if (decision === DECISION.ABORT) {
                    aborted = true;
                    return;
                  }
                  if (decision === DECISION.SKIP) continue;
                } else {
                  if (!checkSimpleFilter("opfs", pathStr, opts)) continue;
                  decision = DECISION.PROCESS;
                }
              }

              const trustChildren = decision === DECISION.TRUST;

              if (entry.kind === "file") {
                await tryGraceful(async () => {
                  const f = await entry.getFile();
                  await tar.writeStream(`opfs/${pathStr}`, f.size, f.stream());
                }, `OPFS file ${pathStr}`);
              } else {
                // Write and recurse
                await tar.writeDir(`opfs/${pathStr}`);
                await walkOpfs(
                  entry,
                  currentPath,
                  trustChildren ? DECISION.TRUST : false,
                );
              }

              const p = yielder();
              if (p) await p;
            }
          } catch (err) {
            // Log error but allow other folders to continue processing
            logger(
              `Error: accessing OPFS folder /${pathArray.join("/")} failed (${err.message})`,
            );
            if (opts.onerror) opts.onerror(err);
            if (!graceful) throw err;
          }
        }

        await walkOpfs(root, [], trustAll ? DECISION.TRUST : false);
      }

      currentFileProgress.written = 0;
      currentFileProgress.total = 0;
    }

    // IndexedDB
    if (!aborted && opts.idb !== false && window.indexedDB && CBOR) {
      let categoryDecision = getDecision(TYPE.IDB);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "IndexedDB";
        const trustAllDbs = categoryDecision === DECISION.TRUST;
        const dbs = await window.indexedDB.databases();

        for (const { name, version } of dbs) {
          if (aborted) break;
          currentFileProgress.written = 0;
          currentFileProgress.total = 0;

          status.detail = name;
          const safeName = encodeURIComponent(name);

          const db = await tryGraceful(async () => {
            return await new Promise((resolve, reject) => {
              const req = indexedDB.open(name);
              const timeout = setTimeout(
                () => reject(new Error(`Database ${name} timed out.`)),
                5000,
              );
              req.onblocked = () => {
                clearTimeout(timeout);
                reject(new Error(`Database ${name} blocked.`));
              };
              req.onsuccess = () => {
                clearTimeout(timeout);
                resolve(req.result);
              };
              req.onerror = () => {
                clearTimeout(timeout);
                reject(req.error);
              };
            });
          }, `Opening IDB ${name}`);

          if (!db) continue;

          let dbDecision = trustAllDbs ? DECISION.TRUST : DECISION.PROCESS;

          if (!trustAllDbs) {
            if (useOnVisit) {
              let raw = getDecision(TYPE.IDB, [name], { database: db });
              if (raw && typeof raw.then === "function") raw = await raw;
              dbDecision = raw;

              if (dbDecision === DECISION.ABORT) {
                aborted = true;
                db.close();
                break;
              }
              if (dbDecision === DECISION.SKIP) {
                db.close();
                continue;
              }
            } else {
              if (!checkSimpleFilter("idb", name, opts)) {
                db.close();
                continue;
              }
            }
          }

          const trustAllStores = dbDecision === DECISION.TRUST;

          try {
            const storeNames = Array.from(db.objectStoreNames);

            if (storeNames.length === 0) {
              await tar.writeEntry(
                `data/idb/${safeName}/schema.${cborExtensionName}`,
                encoder.encode({ name, version, stores: [] }),
              );
              continue;
            }

            const stores = [];
            const tx = db.transaction(storeNames, "readonly");

            for (const sName of storeNames) {
              const s = tx.objectStore(sName);
              stores.push({
                name: sName,
                keyPath: s.keyPath,
                autoIncrement: s.autoIncrement,
                indexes: Array.from(s.indexNames).map((i) => {
                  const idx = s.index(i);
                  return {
                    name: idx.name,
                    keyPath: idx.keyPath,
                    unique: idx.unique,
                    multiEntry: idx.multiEntry,
                  };
                }),
              });
            }

            await tar.writeEntry(
              `data/idb/${safeName}/schema.${cborExtensionName}`,
              encoder.encode({ name, version, stores }),
            );

            for (const sName of storeNames) {
              if (aborted) break;

              let storeDecision = trustAllStores
                ? DECISION.TRUST
                : DECISION.PROCESS;

              if (!trustAllStores) {
                if (useOnVisit) {
                  let raw = getDecision(TYPE.IDB, [name, sName], {
                    database: db,
                  });
                  if (raw && typeof raw.then === "function") raw = await raw;
                  storeDecision = raw;

                  if (storeDecision === DECISION.ABORT) {
                    aborted = true;
                    break;
                  }
                  if (storeDecision === DECISION.SKIP) continue;
                } else {
                  if (!checkSimpleFilter("idb", `${name}/${sName}`, opts))
                    continue;
                }
              }

              status.detail = `${name}/${sName}`;

              let lastKey = null;
              let chunkId = 0;
              let hasMore = true;

              while (hasMore && !aborted) {
                const batch = await tryGraceful(async () => {
                  // Each batch makes a new transaction and finds its start position again. A larger batch gives fewer transactions, but it also uses more memory.
                  const batchSizeLimit = opts.idbBatchSize || 100;
                  return await new Promise((resolve, reject) => {
                    const innerTx = db.transaction(sName, "readonly");
                    const store = innerTx.objectStore(sName);
                    const range =
                      lastKey !== null
                        ? IDBKeyRange.lowerBound(lastKey, true)
                        : null;
                    const request = store.openCursor(range);
                    const keys = [];
                    const values = [];

                    request.onsuccess = (e) => {
                      const cursor = e.target.result;
                      if (cursor && keys.length < batchSizeLimit) {
                        keys.push(cursor.key);
                        values.push(cursor.value);
                        lastKey = cursor.key;
                        cursor.continue();
                      } else {
                        resolve({ keys, values, done: !cursor });
                      }
                    };
                    request.onerror = () => reject(request.error);
                  });
                }, `Reading IDB ${name}/${sName}`);

                if (!batch) break;
                hasMore = !batch.done;

                if (batch.keys.length > 0) {
                  const processedValues = [];
                  for (let i = 0; i < batch.values.length; i++) {
                    const prepared = await prepareForCBOR(
                      batch.values[i],
                      inlineBlobLimit,
                    );
                    processedValues.push(prepared.value);

                    // Write each large blob before the record that points to it. The import reads the archive in sequence.
                    for (const b of prepared.external) {
                      await tar.writeStream(
                        `data/blobs/${b.id}`,
                        b.blob.size,
                        b.blob.stream(),
                      );
                    }
                  }

                  await tar.writeEntry(
                    `data/idb/${safeName}/${encodeURIComponent(sName)}/${chunkId++}.${cborExtensionName}`,
                    encoder.encode([batch.keys, processedValues]),
                  );
                  const p = yielder();
                  if (p) await p;
                }
              }
            }
          } finally {
            db.close();
          }
        }
      }

      currentFileProgress.written = 0;
      currentFileProgress.total = 0;
    }

    // localStorage
    if (!aborted && opts.localStorage !== false) {
      let categoryDecision = getDecision(TYPE.LS);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "Storage";
        const d = {};
        const trustAll = categoryDecision === DECISION.TRUST;

        for (let i = 0; i < localStorage.length && !aborted; i++) {
          const k = localStorage.key(i);
          status.detail = `localStorage: ${k}`;

          let shouldInclude = trustAll;

          if (!shouldInclude) {
            if (useOnVisit) {
              let keyDecision = getDecision(TYPE.LS, [k], {
                value: localStorage.getItem(k),
              });
              if (keyDecision && typeof keyDecision.then === "function")
                keyDecision = await keyDecision;

              if (keyDecision === DECISION.ABORT) {
                aborted = true;
                break;
              }
              shouldInclude = keyDecision !== DECISION.SKIP;
            } else {
              shouldInclude = checkSimpleFilter("localStorage", k, opts);
            }
          }

          if (shouldInclude) {
            d[k] = localStorage.getItem(k);
          }
        }

        if (!aborted && Object.keys(d).length > 0) {
          await tar.writeEntry("data/ls.json", JSON.stringify(d));
        }
      }
    }

    // sessionStorage
    if (!aborted && opts.sessionStorage !== false) {
      let categoryDecision = getDecision(TYPE.SS);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "Storage";
        const d = {};
        const trustAll = categoryDecision === DECISION.TRUST;

        for (let i = 0; i < sessionStorage.length && !aborted; i++) {
          const k = sessionStorage.key(i);
          status.detail = `sessionStorage: ${k}`;

          let shouldInclude = trustAll;

          if (!shouldInclude) {
            if (useOnVisit) {
              let keyDecision = getDecision(TYPE.SS, [k], {
                value: sessionStorage.getItem(k),
              });
              if (keyDecision && typeof keyDecision.then === "function")
                keyDecision = await keyDecision;

              if (keyDecision === DECISION.ABORT) {
                aborted = true;
                break;
              }
              shouldInclude = keyDecision !== DECISION.SKIP;
            } else {
              shouldInclude = checkSimpleFilter("sessionStorage", k, opts);
            }
          }

          if (shouldInclude) {
            d[k] = sessionStorage.getItem(k);
          }
        }

        if (!aborted && Object.keys(d).length > 0) {
          await tar.writeEntry("data/ss.json", JSON.stringify(d));
        }
      }
    }

    // Cookies
    if (!aborted && opts.cookies !== false) {
      let categoryDecision = getDecision(TYPE.COOKIE);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "Storage";
        const c = {};
        const trustAll = categoryDecision === DECISION.TRUST;

        const cookiePairs = document.cookie
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

        for (const pair of cookiePairs) {
          if (aborted) break;

          const eqIndex = pair.indexOf("=");
          const key =
            eqIndex > -1 ? pair.slice(0, eqIndex).trim() : pair.trim();
          const val = eqIndex > -1 ? pair.slice(eqIndex + 1).trim() : "";

          if (!key) continue;

          status.detail = `Cookie: ${key}`;
          let shouldInclude = trustAll;

          if (!shouldInclude) {
            if (useOnVisit) {
              let keyDecision = getDecision(TYPE.COOKIE, [key], {
                value: val,
              });
              if (keyDecision && typeof keyDecision.then === "function")
                keyDecision = await keyDecision;

              if (keyDecision === DECISION.ABORT) {
                aborted = true;
                break;
              }
              shouldInclude = keyDecision !== DECISION.SKIP;
            } else {
              shouldInclude = checkSimpleFilter("cookies", key, opts);
            }
          }

          if (shouldInclude) {
            c[key] = val;
          }
        }

        if (!aborted && Object.keys(c).length > 0) {
          await tar.writeEntry("data/cookies.json", JSON.stringify(c));
        }
      }
    }

    // Cache storage
    if (!aborted && opts.cache !== false && window.caches && CBOR) {
      let categoryDecision = getDecision(TYPE.CACHE);
      if (categoryDecision && typeof categoryDecision.then === "function")
        categoryDecision = await categoryDecision;

      if (categoryDecision === DECISION.ABORT) aborted = true;

      if (!aborted && categoryDecision !== DECISION.SKIP) {
        status.category = "Cache";
        const cacheNames = await caches.keys();
        const trustAll = categoryDecision === DECISION.TRUST;

        for (const cacheName of cacheNames) {
          if (aborted) break;
          currentFileProgress.written = 0;
          currentFileProgress.total = 0;

          let shouldProcess = trustAll;

          if (!shouldProcess) {
            if (useOnVisit) {
              let cacheDecision = getDecision(TYPE.CACHE, [cacheName], null);
              if (cacheDecision && typeof cacheDecision.then === "function")
                cacheDecision = await cacheDecision;

              if (cacheDecision === DECISION.ABORT) {
                aborted = true;
                break;
              }
              shouldProcess = cacheDecision !== DECISION.SKIP;
            } else {
              shouldProcess = checkSimpleFilter("cache", cacheName, opts);
            }
          }

          if (!shouldProcess) continue;

          status.detail = cacheName;
          const p = yielder();
          if (p) await p;

          await tryGraceful(async () => {
            const cache = await caches.open(cacheName);
            // A counter gives a unique name for each record. A short hash of the URL causes collisions, because many URLs have the same start. The true URL stays in the metadata.
            let entryId = 0;
            for (const req of await cache.keys()) {
              const res = await cache.match(req);
              if (!res) continue;
              const blob = await res.blob();
              const safeHash = (entryId++).toString(36);
              const prepared = await prepareForCBOR(blob, inlineBlobLimit);

              // A large body goes in its own entry, before the record
              for (const b of prepared.external) {
                await tar.writeStream(
                  `data/blobs/${b.id}`,
                  b.blob.size,
                  b.blob.stream(),
                );
              }

              await tar.writeEntry(
                `data/cache/${encodeURIComponent(cacheName)}/${safeHash}.${cborExtensionName}`,
                encoder.encode({
                  meta: {
                    url: req.url,
                    status: res.status,
                    headers: Object.fromEntries(res.headers),
                    type: blob.type,
                  },
                  data: prepared.value,
                }),
              );
            }
          }, `Cache ${cacheName}`);
        }
      }

      currentFileProgress.written = 0;
      currentFileProgress.total = 0;
    }

    status.category = "Finishing";
    await tar.close();
    await exportFinishedPromise;

    let result = null;

    flushParts();
    if (blobParts.length > 0) {
      result = new Blob(blobParts, { type: "application/octet-stream" });
    }

    if (opts.download !== false) {
      if (result) {
        const downloadUrl = URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        a.click();

        // Cleanup URL after a delay
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }

      logger("Export complete!");
      return null;
    }

    logger("Export complete!");
    return result;
  } catch (err) {
    try {
      await outputStream.abort(err).catch(() => {});
    } catch (_) {}
    logger(`Error: ${err.message}`);
    if (opts.onerror) opts.onerror(err);
    if (!graceful) throw err;
  }
}

async function importData(config = {}) {
  // Check the LittleExport docs on all the options.
  const opts = {
    logSpeed: 100,
    cborExtensionName: "cbor",
    ...config,
  };

  const decoder =
    opts.decoder ||
    new CBOR.Decoder({
      structuredClone: true, // Circular references may cause errors/problems if disabled.
      bundleStrings: true, // Optimization for strings at the cost of inconsistency with the formal CBOR spec (and lack of explicit documentation in cbor-x to parse). See the LittleExport README for more information.
      copyBuffers: false, // Free optimization of preventing copying of buffers (less memory use).
      // implied
      ...opts.cborOptions,
    });

  const cborExtensionName = opts.cborExtensionName;
  const logger = opts.logger || (() => {});
  const yielder = createYielder(opts.logSpeed);
  const graceful = opts.graceful !== false;
  const useOnVisit = typeof opts.onVisit === "function";
  const onVisit = opts.onVisit;

  let sourceInput = opts.source;
  if (!sourceInput) {
    // Keep the selected file. If you discard the result, the source stays empty and the import fails.
    sourceInput = await new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = (e) => resolve(e.target.files[0] || null);
      input.oncancel = () => resolve(null); // Not all browsers send this event
      input.click();
    });

    if (!sourceInput) {
      logger("Import cancelled.");
      return;
    }
  }

  let aborted = false;
  let rootOpfs = null;
  const categoryDecisions = {};
  const trustedPaths = {};

  // Large blobs come as their own entries. The folder is only made if the archive has such an entry.
  const TEMP_BLOB_DIR = "._littleexport_temp_" + crypto.randomUUID();
  const blobStore = new Map();
  let tempBlobDir = null;

  function getDecision(type, path, meta) {
    if (!useOnVisit) return DECISION.PROCESS;
    return onVisit(type, path, meta);
  }

  async function tryGraceful(fn, context) {
    try {
      return await fn();
    } catch (err) {
      if (opts.onerror) opts.onerror(err);
      if (graceful) {
        logger(`Error: ${context} - ${err.message}`);
        return null;
      }
      throw err;
    }
  }

  async function shouldProcess(type, pathArray, pathStr, categoryKey) {
    if (aborted) return false;

    if (categoryDecisions[categoryKey] === undefined) {
      if (useOnVisit) {
        let decision = getDecision(type);
        if (decision && typeof decision.then === "function")
          decision = await decision;
        categoryDecisions[categoryKey] = decision;

        if (categoryDecisions[categoryKey] === DECISION.ABORT) {
          aborted = true;
          return false;
        }
      } else {
        categoryDecisions[categoryKey] = DECISION.PROCESS;
      }
    }

    if (categoryDecisions[categoryKey] === DECISION.SKIP) return false;
    if (categoryDecisions[categoryKey] === DECISION.TRUST) return true;

    if (useOnVisit && pathArray) {
      if (!trustedPaths[categoryKey]) trustedPaths[categoryKey] = new Set();

      for (let i = 1; i <= pathArray.length; i++) {
        const parentKey = pathArray.slice(0, i).join("/");
        if (trustedPaths[categoryKey].has(parentKey)) return true;
      }

      let decision = getDecision(type, pathArray, null);
      if (decision && typeof decision.then === "function")
        decision = await decision;

      if (decision === DECISION.ABORT) {
        aborted = true;
        return false;
      }
      if (decision === DECISION.SKIP) return false;
      if (decision === DECISION.TRUST) {
        trustedPaths[categoryKey].add(pathArray.join("/"));
      }
      return true;
    } else if (!useOnVisit) {
      // FIX: If pathStr is null, we are checking a parent file container (like data/ls.json).
      // Return true to allow opening the container so individual string keys can be properly filtered.
      if (pathStr === null) return true;
      return checkSimpleFilter(categoryKey, pathStr, opts);
    }

    return true;
  }

  let status = { category: "", detail: "" };
  const dbCache = {};
  let foundEofMarker = false;

  try {
    let rawStream;
    if (typeof sourceInput === "string") {
      const response = await fetch(sourceInput, config.fetchInit);
      if (!response.ok) throw new Error("Fetching of URL failed.");
      rawStream = response.body;
    } else if (sourceInput && typeof sourceInput.stream === "function") {
      rawStream = sourceInput.stream();
    } else {
      throw new Error("Invalid source.");
    }

    const rawReader = rawStream.getReader();
    const initialChunks = [];
    let initialBytes = 0;

    while (initialBytes < 8) {
      const { value, done } = await rawReader.read();
      if (done) break;
      initialChunks.push(value);
      initialBytes += value.byteLength;
    }
    rawReader.releaseLock();

    let totalProcessed = 0;
    const combinedStream = new ReadableStream({
      async start(controller) {
        for (const chunk of initialChunks) {
          controller.enqueue(chunk);
        }
        const reader = rawStream.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const probeHeader = new Uint8Array(8);
    if (initialBytes > 0) {
      let offset = 0;
      for (const chunk of initialChunks) {
        const needed = 8 - offset;
        if (needed <= 0) break;
        const toCopy = Math.min(needed, chunk.byteLength);
        probeHeader.set(chunk.subarray(0, toCopy), offset);
        offset += toCopy;
      }
    }

    const sig = DEC.decode(probeHeader.slice(0, 6));
    let inputStream;

    if (sig === "LE_ENC") {
      if (opts.password === null) {
        throw new Error("A password is required to decrypt this data.");
      }
      let password = opts.password || prompt("Enter the password:");
      if (!password)
        throw new Error("A password is required to decrypt this data.");
      inputStream = new DecryptionSource(combinedStream, password, yielder)
        .readable()
        .pipeThrough(new DecompressionStream("gzip"));
    } else if (probeHeader[0] === 0x1f && probeHeader[1] === 0x8b) {
      inputStream = combinedStream.pipeThrough(new DecompressionStream("gzip"));
    } else {
      inputStream = combinedStream;
    }

    inputStream = inputStream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          totalProcessed += chunk.byteLength;
          controller.enqueue(chunk);
        },
      }),
    );

    const reader = inputStream.getReader();
    const streamBuffer = new ChunkBuffer();
    let done = false;
    let filesProcessed = 0;

    async function ensure(n) {
      while (!streamBuffer.has(n) && !done) {
        const { value, done: d } = await reader.read();
        if (d) done = true;
        else {
          streamBuffer.push(value);
        }
      }
      return streamBuffer.has(n);
    }

    async function skip(n) {
      let remaining = n;
      while (remaining > 0) {
        if (streamBuffer.totalSize === 0 && !done) await ensure(1);
        if (streamBuffer.totalSize === 0) break;
        const toSkip = Math.min(remaining, streamBuffer.totalSize);
        streamBuffer.discard(toSkip);
        remaining -= toSkip;
      }
    }

    async function streamToWriter(writer, size) {
      try {
        let remaining = size;
        while (remaining > 0) {
          const p = yielder();
          if (p) {
            let msg = `Importing ${status.category}: ${(totalProcessed / 1e6).toFixed(2)} MB`;
            if (size > 1e6) {
              msg += ` (${status.detail}: ${((size - remaining) / 1e6).toFixed(1)}/${(size / 1e6).toFixed(1)} MB)`;
            } else {
              msg += ` (${status.detail})`;
            }
            logger(msg);
            await p;
          }

          if (streamBuffer.totalSize > 0) {
            const batchSize = Math.min(remaining, streamBuffer.totalSize);
            await streamBuffer.consume(batchSize, async (chunk) => {
              await writer.write(chunk);
              remaining -= chunk.byteLength;
            });
          } else {
            let { value, done: d } = await reader.read();
            if (d) throw new Error("Unexpected EOF.");
            if (value.byteLength <= remaining) {
              await writer.write(value);
              remaining -= value.byteLength;
            } else {
              await writer.write(value.subarray(0, remaining));
              streamBuffer.push(value.subarray(remaining));
              remaining = 0;
            }
          }
        }
        // Only a close makes the data permanent, thus the file changes in one step.
        await writer.close();
      } catch (err) {
        // Abort keeps the earlier data. A close after an error makes the incomplete file permanent.
        try {
          await writer.abort(err);
        } catch (_) {}
        throw err;
      }
    }

    rootOpfs =
      opts.opfs !== false && navigator.storage
        ? await navigator.storage.getDirectory()
        : null;

    const processedDbSchemas = new Set();

    function parsePax(paxBytes) {
      const res = {};
      let pos = 0;
      while (pos < paxBytes.length) {
        // Find the first space to get the length
        let spacePos = -1;
        for (let i = pos; i < paxBytes.length; i++) {
          if (paxBytes[i] === 32) {
            spacePos = i;
            break;
          }
        }
        if (spacePos === -1) break;

        const lenStr = DEC.decode(paxBytes.subarray(pos, spacePos));
        const len = parseInt(lenStr, 10);
        if (isNaN(len)) break;

        // Slice the exact byte range for this record
        const recordBytes = paxBytes.subarray(pos, pos + len);
        const recordStr = DEC.decode(recordBytes);

        const eq = recordStr.indexOf("=");
        if (eq !== -1) {
          const spaceIdx = recordStr.indexOf(" ");
          const key = recordStr.slice(spaceIdx + 1, eq);
          const val = recordStr.slice(eq + 1, -1); // remove trailing \n
          res[key] = val;
        }
        pos += len;
      }
      return res;
    }

    let paxOverrides = null;

    while (!aborted) {
      const hasHeader = await ensure(512);

      if (!hasHeader) {
        // Stream ended but we never saw the two null blocks
        if (opts.verifyFile !== false && !foundEofMarker) {
          // If we processed at least one file, consider it successful anyway
          if (filesProcessed > 0 && streamBuffer.totalSize === 0) {
            LittleExport.warn(
              "Warning: Stream ended without standard EOF blocks; import likely successful.",
            );
          } else {
            throw new Error("Archive truncated: Stream ended prematurely.");
          }
        }
        break;
      }

      const header = streamBuffer.read(512);

      // Check for the first EOF block (all zeros)
      if (
        opts.verifyFile !== false &&
        header[0] === 0 &&
        header.every((b) => b === 0)
      ) {
        foundEofMarker = true;
        continue;
      }

      if (opts.verifyFile !== false && !verifyChecksum(header)) {
        // Relaxed check: if we are at EOF (trailing garbage) and have processed files, stop.
        if (filesProcessed > 0 && streamBuffer.totalSize === 0 && done) {
          break;
        }
        throw new Error("Corrupt TAR header: Checksum mismatch.");
      }

      let name = DEC.decode(header.slice(0, 100)).replace(/\0/g, "").trim();
      const typeFlag = header[156]; // '0', '5', 'x'
      const sizeStr = DEC.decode(header.slice(124, 136))
        .replace(/\0/g, "")
        .trim();
      const entrySize = parseInt(sizeStr, 8) || 0;
      let padding = (512 - (entrySize % 512)) % 512;

      if (typeFlag === 120) {
        if (!(await ensure(entrySize))) throw new Error("Unexpected EOF.");
        const paxBytes = streamBuffer.read(entrySize);
        await skip(padding);
        paxOverrides = parsePax(paxBytes);
        continue; // Move to the next block which contains the actual file
      }

      let size = entrySize;
      if (paxOverrides) {
        if (paxOverrides.path) name = paxOverrides.path;
        if (paxOverrides.size) {
          size = parseInt(paxOverrides.size, 10);
          // The usual header keeps a size of 0 for very large files. Calculate the padding again from the true size.
          padding = (512 - (size % 512)) % 512;
        }
        paxOverrides = null;
      }

      filesProcessed++;

      if (name.startsWith("data/idb/")) {
        status.category = "IndexedDB";
        const parts = name.split("/");
        status.detail = parts[2] ? decodeURIComponent(parts[2]) : "data";
      } else if (name.startsWith("data/cache/")) {
        status.category = "Cache";
        const parts = name.split("/");
        status.detail = parts[2] ? decodeURIComponent(parts[2]) : "item";
      } else if (name.startsWith("opfs/")) {
        status.category = "OPFS";
        status.detail = name.replace("opfs/", "");
      } else if (name.startsWith("data/blobs/")) {
        status.category = "Blobs";
        status.detail = "Large data";
      } else {
        status.category = "Config";
        status.detail = name;
      }

      const p = yielder();
      if (p) {
        if (status.category)
          logger(
            `Importing ${status.category}: ${(totalProcessed / 1e6).toFixed(2)} MB (${status.detail})`,
          );
        await p;
      }

      if (name.startsWith("data/")) {
        // A large blob comes before the record that uses it. Put it on the disk, then open it now so that restoreFromCBOR can stay synchronous.
        if (name.startsWith("data/blobs/")) {
          const id = name.split("/").pop();
          let stored = false;

          if (rootOpfs) {
            await tryGraceful(async () => {
              if (!tempBlobDir) {
                tempBlobDir = await rootOpfs.getDirectoryHandle(TEMP_BLOB_DIR, {
                  create: true,
                });
              }
              const fh = await tempBlobDir.getFileHandle(id, {
                create: true,
              });
              await streamToWriter(await fh.createWritable(), size);
              blobStore.set(id, await fh.getFile());
              stored = true;
            }, `Blob ${id}`);
          }

          if (!stored) await skip(size);
          await skip(padding);
          continue;
        } else {
          if (size === 0) {
            await skip(padding);
            continue;
          }
          if (!(await ensure(size)))
            throw new Error("Unexpected EOF for metadata.");
          const d = streamBuffer.read(size);

          // localStorage
          if (name === "data/ls.json" && opts.localStorage !== false) {
            if (await shouldProcess(TYPE.LS, null, null, "localStorage")) {
              const data = JSON.parse(DEC.decode(d));
              const trustAll =
                categoryDecisions["localStorage"] === DECISION.TRUST;

              for (const k in data) {
                if (aborted) break;

                let shouldSet = trustAll;

                if (!shouldSet) {
                  if (useOnVisit) {
                    let keyDecision = getDecision(TYPE.LS, [k], {
                      value: data[k],
                    });
                    if (keyDecision && typeof keyDecision.then === "function")
                      keyDecision = await keyDecision;

                    if (keyDecision === DECISION.ABORT) {
                      aborted = true;
                      break;
                    }
                    shouldSet = keyDecision !== DECISION.SKIP;
                  } else {
                    shouldSet = checkSimpleFilter("localStorage", k, opts);
                  }
                }

                if (shouldSet) {
                  localStorage.setItem(k, data[k]);
                }
              }
            }
          }
          // sessionStorage
          else if (name === "data/ss.json" && opts.sessionStorage !== false) {
            if (await shouldProcess(TYPE.SS, null, null, "sessionStorage")) {
              const data = JSON.parse(DEC.decode(d));
              const trustAll =
                categoryDecisions["sessionStorage"] === DECISION.TRUST;

              for (const k in data) {
                if (aborted) break;

                let shouldSet = trustAll;

                if (!shouldSet) {
                  if (useOnVisit) {
                    let keyDecision = getDecision(TYPE.SS, [k], {
                      value: data[k],
                    });
                    if (keyDecision && typeof keyDecision.then === "function")
                      keyDecision = await keyDecision;

                    if (keyDecision === DECISION.ABORT) {
                      aborted = true;
                      break;
                    }
                    shouldSet = keyDecision !== DECISION.SKIP;
                  } else {
                    shouldSet = checkSimpleFilter("sessionStorage", k, opts);
                  }
                }

                if (shouldSet) {
                  sessionStorage.setItem(k, data[k]);
                }
              }
            }
          }
          // Cookies
          else if (name === "data/cookies.json" && opts.cookies !== false) {
            if (await shouldProcess(TYPE.COOKIE, null, null, "cookies")) {
              const c = JSON.parse(DEC.decode(d));
              const trustAll = categoryDecisions["cookies"] === DECISION.TRUST;

              for (const k in c) {
                if (aborted) break;

                let shouldSet = trustAll;

                if (!shouldSet) {
                  if (useOnVisit) {
                    let keyDecision = getDecision(TYPE.COOKIE, [k], {
                      value: c[k],
                    });
                    if (keyDecision && typeof keyDecision.then === "function")
                      keyDecision = await keyDecision;

                    if (keyDecision === DECISION.ABORT) {
                      aborted = true;
                      break;
                    }
                    shouldSet = keyDecision !== DECISION.SKIP;
                  } else {
                    shouldSet = checkSimpleFilter("cookies", k, opts);
                  }
                }

                if (shouldSet) {
                  document.cookie = `${k}=${c[k]}; path=/; max-age=31536000`;
                }
              }
            }
          }
          // Custom items
          else if (name.startsWith("data/custom/") && opts.onCustomItem) {
            await opts.onCustomItem(name.replace("data/custom/", ""), d);
          }
          // IndexedDB
          else if (name.startsWith("data/idb/") && CBOR && opts.idb !== false) {
            const parts = name.split("/");
            const dbName = decodeURIComponent(parts[2]);

            if (name.endsWith("schema." + cborExtensionName)) {
              if (!(await shouldProcess(TYPE.IDB, [dbName], dbName, "idb")))
                continue;

              const schema = decoder.decode(d);
              processedDbSchemas.add(dbName);

              if (dbCache[dbName]) {
                dbCache[dbName].close();
                delete dbCache[dbName];
              }

              await tryGraceful(async () => {
                await new Promise((resolve, reject) => {
                  const q = indexedDB.deleteDatabase(schema.name);
                  q.onsuccess = resolve;
                  q.onerror = () => reject(q.error);
                  q.onblocked = () =>
                    reject(
                      new Error(`Database ${schema.name} deletion blocked.`),
                    );
                });
                await new Promise((resolve, reject) => {
                  const req = indexedDB.open(schema.name, schema.version);
                  req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    schema.stores.forEach((s) => {
                      if (!db.objectStoreNames.contains(s.name)) {
                        const st = db.createObjectStore(s.name, {
                          keyPath: s.keyPath,
                          autoIncrement: s.autoIncrement,
                        });
                        s.indexes.forEach((i) =>
                          st.createIndex(i.name, i.keyPath, {
                            unique: i.unique,
                            multiEntry: i.multiEntry,
                          }),
                        );
                      }
                    });
                  };
                  req.onsuccess = (e) => {
                    e.target.result.close();
                    resolve();
                  };
                  req.onerror = reject;
                  req.onblocked = () =>
                    reject(
                      new Error(`Database ${schema.name} opening blocked.`),
                    );
                });
              }, `IDB schema ${dbName}`);
            } else {
              const storeName = decodeURIComponent(parts[3]);

              if (!processedDbSchemas.has(dbName)) continue;

              if (
                !(await shouldProcess(
                  TYPE.IDB,
                  [dbName, storeName],
                  `${dbName}/${storeName}`,
                  "idb",
                ))
              )
                continue;

              const decoded = decoder.decode(d);
              const [keys, values] = LittleExport.restoreFromCBOR(
                decoded,
                blobStore,
              );

              if (!dbCache[dbName]) {
                const db = await tryGraceful(async () => {
                  return await new Promise((resolve, reject) => {
                    const req = indexedDB.open(dbName);
                    const timeout = setTimeout(
                      () => reject(new Error(`Database ${dbName} timed out.`)),
                      5000,
                    );
                    req.onblocked = () => {
                      clearTimeout(timeout);
                      reject(new Error(`Database ${dbName} opening blocked.`));
                    };
                    req.onsuccess = () => {
                      clearTimeout(timeout);
                      resolve(req.result);
                    };
                    req.onerror = () => {
                      clearTimeout(timeout);
                      reject(req.error);
                    };
                  });
                }, `Opening IDB ${dbName}`);

                if (!db) continue;
                dbCache[dbName] = db;
              }

              await tryGraceful(async () => {
                const tx = dbCache[dbName].transaction(storeName, "readwrite");
                const st = tx.objectStore(storeName);
                for (let i = 0; i < keys.length; i++) {
                  st.put(values[i], st.keyPath ? undefined : keys[i]);
                }
                await new Promise((resolve, reject) => {
                  tx.oncomplete = resolve;
                  tx.onerror = () => reject(tx.error);
                  tx.onabort = () => reject(new Error("Transaction aborted."));
                });
              }, `IDB ${dbName}/${storeName}`);
            }
          }
          // Cache storage
          else if (
            name.startsWith("data/cache/") &&
            CBOR &&
            opts.cache !== false
          ) {
            const parts = name.split("/");
            const cacheName = decodeURIComponent(parts[2]);

            if (
              await shouldProcess(TYPE.CACHE, [cacheName], cacheName, "cache")
            ) {
              await tryGraceful(async () => {
                const data = decoder.decode(d);
                const cache = await caches.open(cacheName);
                const restoredData = LittleExport.restoreFromCBOR(
                  data.data,
                  blobStore,
                );
                const blob =
                  restoredData instanceof Blob
                    ? restoredData
                    : new Blob([restoredData]);
                const response = new Response(blob, {
                  status: data.meta.status,
                  headers: data.meta.headers,
                });
                await cache.put(data.meta.url, response);
              }, `Cache ${cacheName}`);
            }
          }
        }
      } else {
        // OPFS files and directories
        if (opts.opfs !== false) {
          const cleanName = name.startsWith("opfs/") ? name.slice(5) : name;
          const isDirectory = cleanName.endsWith("/") || header[156] === 53;
          const normalizedName = cleanName.replace(/\/$/, "");
          const parts = normalizedName.split("/").filter((p) => p.length);

          if (parts.length > 0) {
            const pathArray = [...parts];

            if (
              await shouldProcess(TYPE.OPFS, pathArray, normalizedName, "opfs")
            ) {
              await tryGraceful(async () => {
                let dir = rootOpfs;
                if (isDirectory) {
                  for (const p of parts) {
                    dir = await dir.getDirectoryHandle(p, { create: true });
                  }
                } else {
                  const fname = parts[parts.length - 1];
                  const dirParts = parts.slice(0, -1);
                  for (const p of dirParts) {
                    dir = await dir.getDirectoryHandle(p, { create: true });
                  }
                  const fh = await dir.getFileHandle(fname, { create: true });
                  if (size > 0) {
                    await streamToWriter(await fh.createWritable(), size);
                  } else {
                    const w = await fh.createWritable();
                    await w.close();
                  }
                }
              }, `OPFS ${normalizedName}`);
            } else {
              await skip(size);
            }
          } else {
            await skip(size);
          }
        } else {
          await skip(size);
        }
      }
      await skip(padding);
    }

    Object.values(dbCache).forEach((d) => d.close());
    if (!aborted) {
      logger("Import complete!");
    }
  } catch (err) {
    Object.values(dbCache).forEach((d) => {
      try {
        d.close();
      } catch (err) {}
    });

    logger(`Error: ${err.message}`);
    if (opts.onerror) opts.onerror(err);
    if (!graceful) throw err;
  } finally {
    // Remove the temporary folder only if the archive made one.
    if (tempBlobDir && rootOpfs) {
      blobStore.clear();
      try {
        await rootOpfs.removeEntry(TEMP_BLOB_DIR, { recursive: true });
      } catch (err) {}
    }
  }
}

function folderToTarStream(source, yielder, options = {}) {
  const { readable, writable } = new TransformStream();
  // Generate stream on the fly
  const tar = new TarWriter(writable, yielder);
  const pathPrefix = options.pathPrefix || "";
  const safePrefix =
    pathPrefix && !pathPrefix.endsWith("/") ? pathPrefix + "/" : pathPrefix;

  (async () => {
    try {
      if (
        window.FileSystemDirectoryHandle &&
        source instanceof FileSystemDirectoryHandle
      ) {
        // Each level keeps its own lists. Shared lists cause a second write of the files of the parent folder.
        async function collect(dir, currentPath) {
          const files = [];
          const dirs = [];

          for await (const [name, entry] of dir.entries()) {
            if (entry.kind === "directory" && name === "PaxHeaders") continue;
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            if (entry.kind === "file") files.push({ entry, fullPath });
            else dirs.push({ entry, fullPath });
          }
          // Sort files so that 'schema.cbor' is processed before numbered chunks
          files.sort((a, b) => {
            if (
              a.fullPath.includes("schema.") &&
              !b.fullPath.includes("schema.")
            )
              return -1;
            if (
              !a.fullPath.includes("schema.") &&
              b.fullPath.includes("schema.")
            )
              return 1;
            return a.fullPath.localeCompare(b.fullPath);
          });

          for (const f of files) {
            const file = await f.entry.getFile();
            await tar.writeStream(
              safePrefix + f.fullPath,
              file.size,
              file.stream(),
            );
          }
          for (const d of dirs) {
            await tar.writeDir(safePrefix + d.fullPath);
            await collect(d.entry, d.fullPath);
          }
        }
        await collect(source, "");
      } else if (
        source instanceof FileList ||
        (Array.isArray(source) && source[0] instanceof File)
      ) {
        // Sort the FileList/Array by path string
        const files = Array.from(source).sort((a, b) => {
          const pathA = a.webkitRelativePath || a.name;
          const pathB = b.webkitRelativePath || b.name;
          // Ensure schemas come first within their respective folders
          if (pathA.includes("schema.") && !pathB.includes("schema."))
            return -1;
          if (!pathA.includes("schema.") && pathB.includes("schema.")) return 1;
          return pathA.localeCompare(pathB);
        });

        const refFile =
          files.find(
            (f) => f.webkitRelativePath && f.webkitRelativePath.includes("/"),
          ) || files[0];
        const relativePath = refFile ? refFile.webkitRelativePath : "";
        const rootName =
          relativePath && relativePath.includes("/")
            ? relativePath.split("/")[0] + "/"
            : ""; // Only strip root if valid structure found

        for (const file of files) {
          let path = file.webkitRelativePath;
          if (path && path.startsWith(rootName)) {
            path = path.slice(rootName.length);
          }

          if (!path) path = file.name;
          await tar.writeStream(safePrefix + path, file.size, file.stream());
        }
      }
      await tar.close();
    } catch (err) {
      try {
        await writable.abort(err);
      } catch (_) {}
    }
  })();

  return readable;
}

async function importFromFolder(config = {}) {
  const opts = config;
  const yielder = createYielder(opts.logSpeed);
  let logger = opts.logger || (() => {});

  // Helper to run the importData logic using our custom stream
  const runImport = (streamSource) => {
    return importData({
      ...opts,
      source: {
        stream: () => streamSource,
      },
    });
  };

  if (window.showDirectoryPicker && opts.legacy === false) {
    try {
      const handle = await window.showDirectoryPicker();
      const stream = folderToTarStream(handle, yielder, {
        pathPrefix: opts.pathPrefix,
      });
      return await runImport(stream);
    } catch (err) {
      if (err.name === "AbortError") {
        logger("User cancelled the directory picker.");
        return;
      }
      LittleExport.warn(
        "Directory Picker failed, falling back to legacy input.",
        err,
      );
    }
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) {
        resolve(); // Cancelled or empty
        return;
      }

      try {
        const stream = folderToTarStream(input.files, yielder, {
          pathPrefix: opts.pathPrefix,
        });
        await runImport(stream);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(input);
      }
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve();
    };

    input.click();
  });
}

async function clearData(types = {}) {
  // default to clearing everything if no types provided
  if (Object.keys(types).length === 0) {
    types = {
      opfs: true,
      idb: true,
      localStorage: true,
      sessionStorage: true,
      cookies: true,
      cache: true,
    };
  }

  if (types.opfs && navigator.storage) {
    try {
      const root = await navigator.storage.getDirectory();
      for await (const name of root.keys()) {
        await root.removeEntry(name, { recursive: true });
      }
    } catch (err) {
      LittleExport.warn("Failed to clear OPFS:", err);
    }
  }

  if (types.localStorage) {
    try {
      localStorage.clear();
    } catch (err) {
      LittleExport.warn("Failed to clear localStorage:", err);
    }
  }

  if (types.sessionStorage) {
    try {
      sessionStorage.clear();
    } catch (err) {
      LittleExport.warn("Failed to clear sessionStorage:", err);
    }
  }

  if (types.cookies) {
    try {
      // Note that this cookie logic is not guaranteed to clear custom domains or non-standard paths.
      const cookies = document.cookie.split(";");

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.trim().substring(0, eqPos) : cookie.trim();

        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`; // current path
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}; path=/`; // current domain
        const domainParts = window.location.hostname.split(".");
        if (domainParts.length > 2) {
          const baseDomain = domainParts.slice(-2).join(".");
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${baseDomain}; path=/`; // clear base domain
        }
      }
    } catch (err) {
      LittleExport.warn("Failed to clear cookies:", err);
    }
  }

  if (types.cache && window.caches) {
    try {
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
    } catch (err) {
      LittleExport.warn("Failed to clear cache:", err);
    }
  }

  if (types.idb && window.indexedDB) {
    try {
      const dbs = await window.indexedDB.databases();
      // Create an array of promises to await all deletions
      await Promise.all(
        dbs.map((db) => {
          return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = resolve;
            req.onerror = () => reject(req.error);
            req.onblocked = () => {
              LittleExport.warn(`Database ${db.name} deletion blocked.`);
              resolve();
            };
          });
        }),
      );
    } catch (err) {
      LittleExport.warn("Failed to clear IndexedDB:", err);
    }
  }
}

const LittleExport = {
  importData,
  exportData,
  deriveKey,
  prepForCBOR,
  prepareForCBOR,
  restoreFromCBOR,
  importFromFolder,
  folderToTarStream,
  clearData,
  TYPE,
  warn: console.warn,
  DECISION,
};

export default LittleExport;
