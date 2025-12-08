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

  // Farklı satır sonlarını normalize et (CRLF -> LF)
  cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Satırları ayır ve boş satırları filtrele
  const lines = cleanText.split('\n').map(line => line.trim()).filter((line) => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV dosyası en az bir başlık ve bir veri satırı içermelidir.');
  }

  // İlk satır başlık satırı
  const headerLine = lines[0];
  console.log('🔍 DEBUG 1 - Header Line (ham):', JSON.stringify(headerLine));
  console.log('🔍 DEBUG 1 - Header Line (görünür):', headerLine);
  
  // Delimiter tespiti - Her iki delimiter'ı da dene, hangisi daha fazla kolon veriyorsa onu kullan
  let delimiter = ';';
  let fileHeaders: string[] = [];
  
  // Önce noktalı virgül ile dene
  const semicolonHeaders = headerLine.split(';').map(h => {
    // Tırnak işaretlerini ve fazla boşlukları temizle
    let cleaned = h.trim();
    cleaned = cleaned.replace(/^["']|["']$/g, ''); // Başta ve sonda tırnak varsa kaldır
    cleaned = cleaned.trim();
    return cleaned.toLowerCase();
  }).filter(h => h.length > 0);
  
  // Sonra virgül ile dene
  const commaHeaders = headerLine.split(',').map(h => {
    let cleaned = h.trim();
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    cleaned = cleaned.trim();
    return cleaned.toLowerCase();
  }).filter(h => h.length > 0);
  
  // Hangisi daha fazla kolon veriyorsa onu kullan
  if (semicolonHeaders.length >= commaHeaders.length && semicolonHeaders.length > 0) {
    delimiter = ';';
    fileHeaders = semicolonHeaders;
  } else if (commaHeaders.length > 0) {
    delimiter = ',';
    fileHeaders = commaHeaders;
  } else {
    // Hiçbiri çalışmazsa noktalı virgül kullan
    delimiter = ';';
    fileHeaders = semicolonHeaders;
  }
  
  console.log('🔍 DEBUG 2 - Delimiter tespiti:', {
    delimiter,
    semicolonHeaders,
    commaHeaders,
    selectedHeaders: fileHeaders,
    'headerLine.includes(";")': headerLine.includes(';'),
    'headerLine.includes(",")': headerLine.includes(',')
  });
  
  if (fileHeaders.length === 0) {
    throw new Error(`CSV başlık satırı bulunamadı. İlk satır: "${headerLine}"`);
  }

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

  // Veri satırlarını parse et
  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) {
      console.log(`🔍 DEBUG 7 - Satır ${i + 1} - Boş satır, atlanıyor`);
      continue;
    }

    console.log(`🔍 DEBUG 7 - Satır ${i + 1} - Ham satır:`, JSON.stringify(line));
    
    // Delimiter ile split yap
    const rawValues = line.split(delimiter);
    console.log(`🔍 DEBUG 8 - Satır ${i + 1} - Raw values (split by "${delimiter}"):`, rawValues);
    console.log(`🔍 DEBUG 8.1 - Satır ${i + 1} - Raw values count:`, rawValues.length);
    
    // Değerleri temizle: tırnak işaretlerini kaldır ve trim yap
    const values = rawValues.map((v, idx) => {
      let cleaned = v.trim();
      cleaned = cleaned.replace(/^["']|["']$/g, ''); // Başta ve sonda tırnak varsa kaldır
      cleaned = cleaned.trim();
      console.log(`🔍 DEBUG 8.2 - Satır ${i + 1}, Değer ${idx}: "${v}" -> "${cleaned}"`);
      return cleaned;
    });
    console.log(`🔍 DEBUG 9 - Satır ${i + 1} - Trimmed values:`, values);
    console.log(`🔍 DEBUG 10 - Satır ${i + 1} - Headers count: ${fileHeaders.length}, Values count: ${values.length}`);
    
    // CSV'deki TÜM başlıkları kullanarak obje oluştur
    const item: Record<string, string> = {};
    
    // ÖNCE: Tüm CSV başlıklarını ekle (küçük harf olarak)
    fileHeaders.forEach((header, idx) => {
      const value = (values[idx] || '').trim();
      item[header] = value; // header zaten küçük harf (ad, kod, sinif, donem, fakultekod)
      console.log(`🔍 DEBUG 11 - Satır ${i + 1} - item["${header}"] = "${value}" (index: ${idx}, raw: "${rawValues[idx]}")`);
    });
    
    // SONRA: Required ve optional başlıkları da ekle (büyük/küçük harf farkı için)
    // Bu, hem küçük harf hem de orijinal case'de erişim sağlar
    [...requiredHeaders, ...optionalHeaders].forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();
      // fileHeaders'da ara (zaten küçük harf)
      if (fileHeaders.includes(normalizedHeader)) {
        const headerIndex = fileHeaders.indexOf(normalizedHeader);
        const value = (values[headerIndex] || '').trim();
        // Hem küçük harf hem de orijinal case ile ekle
        item[normalizedHeader] = value; // Küçük harf (zaten var ama emin olmak için)
        item[header] = value; // Orijinal case ile ekle (sinif, donem)
        console.log(`🔍 DEBUG 12 - Satır ${i + 1} - Added item["${header}"] = "${value}" from index ${headerIndex} (normalized: "${normalizedHeader}")`);
      }
    });
    
    // EK GÜVENLİK: Eğer hala ad/kod/sinif/donem yoksa, pozisyona göre ekle
    if ((!item.ad || !item.ad.trim()) && values.length > 0) {
      item.ad = values[0].trim();
      console.log(`🔍 DEBUG 13 - Satır ${i + 1} - item.ad fallback: "${item.ad}"`);
    }
    if ((!item.kod || !item.kod.trim()) && values.length > 1) {
      item.kod = values[1].trim();
      console.log(`🔍 DEBUG 14 - Satır ${i + 1} - item.kod fallback: "${item.kod}"`);
    }
    if ((!item.sinif || !item.sinif.trim()) && values.length > 2) {
      item.sinif = values[2].trim();
      console.log(`🔍 DEBUG 15 - Satır ${i + 1} - item.sinif fallback: "${item.sinif}"`);
    }
    if ((!item.donem || !item.donem.trim()) && values.length > 3) {
      item.donem = values[3].trim();
      console.log(`🔍 DEBUG 16 - Satır ${i + 1} - item.donem fallback: "${item.donem}"`);
    }

    console.log(`🔍 DEBUG 15 - Satır ${i + 1} - Final item:`, JSON.stringify(item, null, 2));
    console.log(`🔍 DEBUG 16 - Satır ${i + 1} - item.ad:`, item.ad, `item.kod:`, item.kod);
    console.log(`🔍 DEBUG 17 - Satır ${i + 1} - item keys:`, Object.keys(item));
    console.log(`🔍 DEBUG 18 - Satır ${i + 1} - item values:`, Object.values(item));

    // Boş satırları atla
    if (Object.values(item).every((v) => !v || !String(v).trim())) {
      console.log(`🔍 DEBUG 19 - Satır ${i + 1} - Boş satır, atlanıyor`);
      continue;
    }

    console.log(`🔍 DEBUG 20 - Satır ${i + 1} - Item eklendi, toplam: ${data.length + 1}`);
    data.push(item as T);
  }
  
  console.log('🔍 DEBUG 17 - Toplam parse edilen satır sayısı:', data.length);
  if (data.length > 0) {
    console.log('🔍 DEBUG 18 - İlk satır parse sonucu:', JSON.stringify(data[0], null, 2));
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
