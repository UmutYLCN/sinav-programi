/**
 * CSV dosyasını parse eder ve verileri döndürür
 * @param csvText CSV dosyasının metin içeriği
 * @param requiredHeaders Zorunlu başlıklar (en az biri olmalı)
 * @param optionalHeaders Opsiyonel başlıklar (varsa kullanılır)
 */
export function parseCSV<T>(
  csvText: string,
  requiredHeaders: string[],
  optionalHeaders: string[] = [],
): T[] {
  // UTF-8 BOM'u temizle
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1);
  }

  // Satır sonlarını normalize et (sadece tırnak dışındakiler için ama basitlik için genel kalsın)
  // Tam çözüm için karakter bazlı okuma daha iyidir.

  const result: T[] = [];
  let currentField = '';
  let inQuotes = false;
  let currentRow: string[] = [];
  let delimiter = '';

  // Delimiter tespiti (ilk satıra bakarak)
  const firstLine = cleanText.split('\n')[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  delimiter = semicolonCount >= commaCount && semicolonCount > 0 ? ';' : ',';

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Çift tırnak (escaped quote)
        currentField += '"';
        i++;
      } else {
        // Tırnak başlangıcı veya sonu
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || (char === '\r' && nextChar !== '\n')) && !inQuotes) {
      currentRow.push(currentField.trim());
      result.push(currentRow as any);
      currentRow = [];
      currentField = '';
    } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      result.push(currentRow as any);
      currentRow = [];
      currentField = '';
      i++; // \n'i atla
    } else {
      currentField += char;
    }
  }

  // Son kalanları ekle
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    result.push(currentRow as any);
  }

  if (result.length < 2) {
    throw new Error('CSV dosyası en az bir başlık ve bir veri satırı içermelidir.');
  }

  const rawHeaders = result[0] as unknown as string[];
  const fileHeaders = rawHeaders.map(h => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));

  // Zorunlu başlıkları kontrol et
  const missingRequiredHeaders = requiredHeaders.filter(
    (h) => !fileHeaders.includes(h.toLowerCase()),
  );
  if (missingRequiredHeaders.length > 0) {
    throw new Error(
      `Eksik başlıklar: ${missingRequiredHeaders.join(', ')}. ` +
      `CSV'deki başlıklar: ${fileHeaders.join(', ')}`
    );
  }

  const data: T[] = [];
  for (let i = 1; i < result.length; i++) {
    const values = result[i] as unknown as string[];
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const item: Record<string, string> = {};
    fileHeaders.forEach((header, idx) => {
      item[header] = (values[idx] || '').trim();
    });

    // Case-insensitive access for required/optional headers
    [...requiredHeaders, ...optionalHeaders].forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();
      if (fileHeaders.includes(normalizedHeader)) {
        item[header] = item[normalizedHeader];
      }
    });

    // Boş satırları atla
    if (Object.values(item).every((v) => !v || !String(v).trim())) continue;

    data.push(item as T);
  }

  return data;
}

/**
 * CSV dosyasını okur ve parse eder
 */
export async function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı.'));
    };
    reader.readAsText(file, 'UTF-8');
  });
}
