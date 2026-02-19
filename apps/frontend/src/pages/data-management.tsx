import { useMemo, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Faculty, Department, Course, Room, Instructor } from '@sinav/shared';
import { useFaculties, useImportFaculties, useDeleteFaculty, importFaculties } from '@/services/faculties';
import { useDepartments, useImportDepartments, useDeleteDepartment, importDepartments } from '@/services/departments';
import { useCourses, useImportCourses, useDeleteCourse, importCourses } from '@/services/courses';
import { useRooms, useImportRooms, useDeleteRoom, importRooms } from '@/services/rooms';
import { useInstructors, useImportInstructors, useDeleteInstructor, importInstructors } from '@/services/instructors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AddFacultyForm } from '@/components/forms/add-faculty-form';
import { AddDepartmentForm } from '@/components/forms/add-department-form';
import { AddCourseForm } from '@/components/forms/add-course-form';
import { AddRoomForm } from '@/components/forms/add-room-form';
import { AddInstructorForm } from '@/components/forms/add-instructor-form';
import { readCSVFile, parseCSV } from '@/lib/csv-utils';
import { Trash2, Pencil } from 'lucide-react';

type TabKey = 'faculties' | 'departments' | 'instructors' | 'courses' | 'rooms';

const TABS: { key: TabKey; label: string; description: string }[] = [
  {
    key: 'faculties',
    label: 'Fakülteler',
    description: 'Fakülte kayıtlarını yönetin, bölümlerle ilişkilendirin.',
  },
  {
    key: 'departments',
    label: 'Bölümler',
    description: 'Bölüm bilgilerini düzenleyin, fakültelerle eşleştirin.',
  },
  {
    key: 'instructors',
    label: 'Öğretim Üyeleri',
    description: 'Gözetmen rollerini ve iletişim bilgilerini güncelleyin.',
  },
  {
    key: 'courses',
    label: 'Dersler',
    description: 'Ders kodlarını, sınıf ve dönem bilgilerini yönetin.',
  },
  {
    key: 'rooms',
    label: 'Derslikler',
    description: 'Derslik kapasite ve bina bilgilerini takip edin.',
  },
];

export default function DataManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('faculties');
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [pendingImportMutation, setPendingImportMutation] = useState<any>(null);
  const [previewActiveTab, setPreviewActiveTab] = useState<TabKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: facultiesResponse,
    isLoading: facultiesLoading,
    isError: facultiesError,
    error: facultiesErrorObj,
  } = useFaculties();
  const {
    data: departments,
    isLoading: departmentsLoading,
    isError: departmentsError,
  } = useDepartments();
  const {
    data: instructors,
    isLoading: instructorsLoading,
    isError: instructorsError,
  } = useInstructors();
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useCourses();
  const {
    data: rooms,
    isLoading: roomsLoading,
    isError: roomsError,
  } = useRooms();

  const searchValue = search.trim().toLowerCase();

  const faculties = facultiesResponse?.veriler ?? [];
  const activeList = useMemo(() => {
    switch (activeTab) {
      case 'faculties':
        return filterFaculties(faculties, searchValue);
      case 'departments':
        return filterDepartments(departments ?? [], searchValue);
      case 'instructors':
        return filterInstructors(instructors ?? [], searchValue);
      case 'courses':
        return filterCourses(courses ?? [], searchValue);
      case 'rooms':
        return filterRooms(rooms ?? [], searchValue);
      default:
        return [];
    }
  }, [
    activeTab,
    courses,
    departments,
    faculties,
    instructors,
    rooms,
    searchValue,
  ]);

  const loading =
    (activeTab === 'faculties' && facultiesLoading) ||
    (activeTab === 'departments' && departmentsLoading) ||
    (activeTab === 'instructors' && instructorsLoading) ||
    (activeTab === 'courses' && coursesLoading) ||
    (activeTab === 'rooms' && roomsLoading);

  const errored =
    (activeTab === 'faculties' && facultiesError) ||
    (activeTab === 'departments' && departmentsError) ||
    (activeTab === 'instructors' && instructorsError) ||
    (activeTab === 'courses' && coursesError) ||
    (activeTab === 'rooms' && roomsError);

  const tabDescription =
    TABS.find((tab) => tab.key === activeTab)?.description ?? '';

  // Import mutations
  const importFacultiesMutation = useImportFaculties();
  const importDepartmentsMutation = useImportDepartments();
  const importCoursesMutation = useImportCourses();
  const importRoomsMutation = useImportRooms();
  const importInstructorsMutation = useImportInstructors();

  // Delete mutations
  const deleteFacultyMutation = useDeleteFaculty();
  const deleteDepartmentMutation = useDeleteDepartment();
  const deleteCourseMutation = useDeleteCourse();
  const deleteRoomMutation = useDeleteRoom();
  const deleteInstructorMutation = useDeleteInstructor();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya uzantısını kontrol et (CSV veya TXT kabul et)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.txt')) {
      setImportError(
        `Yanlış dosya formatı! Lütfen CSV veya TXT dosyası yükleyin. Yüklediğiniz dosya: ${file.name}. ` +
        `Excel dosyası (.xlsx) yüklediyseniz, lütfen Excel'de "Farklı Kaydet" > "CSV (Virgülle Ayrılmış) (*.csv)" veya "Metin (Sekmeyle Ayrılmış) (*.txt)" seçeneğini kullanarak CSV/TXT formatına dönüştürün.`
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImportError(null);
    setImportSuccess(null);

    try {
      const csvText = await readCSVFile(file);

      // CSV dosyasının gerçekten CSV olduğunu kontrol et (Excel dosyası değilse)
      if (csvText.startsWith('PK') || csvText.includes('[Content_Types].xml')) {
        throw new Error(
          'Bu bir Excel dosyası (.xlsx) gibi görünüyor. Lütfen Excel\'de "Farklı Kaydet" > "CSV (Virgülle Ayrılmış) (*.csv)" seçeneğini kullanarak CSV formatına dönüştürün.'
        );
      }

      let headers: string[] = [];
      let parseData: any[] = [];
      let importMutation: any;

      switch (activeTab) {
        case 'faculties':
          headers = ['ad', 'kod'];
          parseData = parseCSV<{ ad: string; kod: string }>(csvText, headers);
          importMutation = importFacultiesMutation;
          break;
        case 'departments':
          // FakulteId, fakulteKod veya fakulteAd kabul edilir (opsiyonel)
          // Ayrıca fakultekoc (yazım hatası) da kabul edilir
          const requiredHeaders = ['ad', 'kod'];
          const optionalHeaders = ['fakulteid', 'fakultekod', 'fakultekoc', 'fakultead'];

          // Debug: CSV metnini kontrol et
          console.log('CSV Metni (ilk 500 karakter):', csvText.substring(0, 500));

          console.log('🔍 PARSE ÖNCESİ - CSV Text (ilk 500 karakter):', csvText.substring(0, 500));
          console.log('🔍 PARSE ÖNCESİ - Required headers:', requiredHeaders);
          console.log('🔍 PARSE ÖNCESİ - Optional headers:', optionalHeaders);

          parseData = parseCSV<{
            ad: string;
            kod: string;
            fakulteid?: string;
            fakultekod?: string;
            fakultead?: string;
          }>(csvText, requiredHeaders, optionalHeaders);

          // Debug: Parse sonucunu kontrol et
          console.log('🔍 PARSE SONRASI - Parse edilmiş veri sayısı:', parseData.length);
          console.log('🔍 PARSE SONRASI - Parse edilmiş veri type:', typeof parseData);
          console.log('🔍 PARSE SONRASI - Parse edilmiş veri Array mi?', Array.isArray(parseData));
          if (parseData.length > 0) {
            console.log('🔍 PARSE SONRASI - İlk satır parse sonucu:', JSON.stringify(parseData[0], null, 2));
            console.log('🔍 PARSE SONRASI - İlk satırın tüm anahtarları:', Object.keys(parseData[0]));
            console.log('🔍 PARSE SONRASI - İlk satırın tüm değerleri:', Object.values(parseData[0]));
          } else {
            console.error('🔍 PARSE ERROR - Parse edilmiş veri boş!');
            throw new Error('CSV dosyası parse edilemedi veya boş. Lütfen CSV dosyanızı kontrol edin.');
          }

          importMutation = importDepartmentsMutation;
          break;
        case 'courses':
          // BolumId, bolumKod veya bolumAd kabul edilir (opsiyonel)
          const courseRequiredHeaders = ['kod', 'ad', 'sinif', 'donem'];
          const courseOptionalHeaders = ['bolumid', 'bolumkod', 'bolumad', 'kredi', 'ogrencikapasitesi', 'ogrenciKapasitesi', 'kapasite'];
          parseData = parseCSV<{
            kod: string;
            ad: string;
            sinif: string;
            donem: string;
            bolumid?: string;
            bolumkod?: string;
            bolumad?: string;
            kredi?: string;
            ogrencikapasitesi?: string;
            ogrenciKapasitesi?: string;
            kapasite?: string;
          }>(csvText, courseRequiredHeaders, courseOptionalHeaders);
          importMutation = importCoursesMutation;
          break;
        case 'rooms':
          headers = ['ad', 'bina', 'tip', 'kapasite'];
          parseData = parseCSV<{ ad: string; bina: string; tip: string; kapasite: string }>(csvText, headers);
          importMutation = importRoomsMutation;
          break;
        case 'instructors':
          const instrReqHeaders = ['ad', 'email'];
          const instrOptHeaders = ['bolumid', 'bolumkod', 'bolumad', 'unvan'];
          parseData = parseCSV<{ ad: string; email: string; bolumid?: string; bolumkod?: string; bolumad?: string; unvan?: string }>(csvText, instrReqHeaders, instrOptHeaders);
          importMutation = importInstructorsMutation;
          break;
      }

      // Transform data based on tab
      let transformedData: any[] = [];

      // Debug: Transform öncesi
      console.log('🔍 TRANSFORM ÖNCESİ - Parse edilmiş veri:', parseData);
      console.log('🔍 TRANSFORM ÖNCESİ - Parse edilmiş veri sayısı:', parseData.length);

      if (activeTab === 'courses') {
        transformedData = parseData.map((item: any, index: number) => {
          // Tüm olası key varyasyonlarını kontrol et
          const kodValue = item.kod || item['kod'] || item.KOD || item['KOD'];
          const adValue = item.ad || item['ad'] || item.AD || item['AD'];
          const sinifValue = item.sinif || item['sinif'] || item.SINIF || item['SINIF'] || item.sinif_ || item['sinif_'];
          const donemValue = item.donem || item['donem'] || item.DONEM || item['DONEM'] || item.donem_ || item['donem_'];

          // Eğer hala bulunamadıysa, tüm key'leri kontrol et (case-insensitive)
          let sinifFound = sinifValue;
          let donemFound = donemValue;

          if (!sinifFound) {
            const sinifKey = Object.keys(item || {}).find(k => k.toLowerCase() === 'sinif');
            if (sinifKey) sinifFound = item[sinifKey];
          }

          if (!donemFound) {
            const donemKey = Object.keys(item || {}).find(k => k.toLowerCase() === 'donem');
            if (donemKey) donemFound = item[donemKey];
          }

          const result: any = {
            kod: String(kodValue || '').trim(),
            ad: String(adValue || '').trim(),
            sinif: sinifFound ? parseInt(String(sinifFound).trim(), 10) : 0,
            donem: donemFound ? (String(donemFound).toLowerCase().trim() === 'güz' || String(donemFound).toLowerCase().trim() === 'guz' ? 'guz' : 'bahar') : 'guz',
          };

          // Eğer sinif veya donem hala yoksa, hata ver
          if (!result.kod || !result.ad || !sinifFound || !donemFound) {
            throw new Error(
              `Satır ${index + 2}: Eksik bilgi. ` +
              `Kod: ${result.kod || 'YOK'}, Ad: ${result.ad || 'YOK'}, ` +
              `Sınıf: ${sinifFound || 'YOK'}, Dönem: ${donemFound || 'YOK'}. ` +
              `Mevcut kolonlar: ${Object.keys(item || {}).join(', ')}`
            );
          }

          // Kredi bilgisi
          if (item.kredi && String(item.kredi).trim()) {
            const krediValue = parseInt(String(item.kredi).trim(), 10);
            if (!isNaN(krediValue) && krediValue > 0) {
              result.kredi = krediValue;
            }
          }

          // Öğrenci kapasitesi bilgisi
          const kapasiteValue = item.ogrencikapasitesi || item.ogrenciKapasitesi || item.kapasite || item['ogrencikapasitesi'] || item['ogrenciKapasitesi'] || item['kapasite'];
          if (kapasiteValue && String(kapasiteValue).trim()) {
            const kapasiteInt = parseInt(String(kapasiteValue).trim(), 10);
            if (!isNaN(kapasiteInt) && kapasiteInt > 0) {
              result.ogrenciKapasitesi = kapasiteInt;
            }
          }

          // Bölüm bilgileri (en az biri olmalı)
          if (item.bolumid && String(item.bolumid).trim()) {
            result.bolumId = String(item.bolumid).trim();
          }

          // BolumKod için tüm olası şekilleri kontrol et
          const bolumKodValue = item.bolumkod || item.bolumKod || item['bolumkod'] || item['bolumKod'];
          if (bolumKodValue && String(bolumKodValue).trim()) {
            result.bolumKod = String(bolumKodValue).trim();
          }

          if (item.bolumad || item.bolumAd) {
            result.bolumAd = String(item.bolumad || item.bolumAd).trim();
          }

          // En az bir bölüm bilgisi olmalı
          if (!result.bolumId && !result.bolumKod && !result.bolumAd) {
            throw new Error(
              `Satır ${index + 2}: Ders "${result.kod}" için bölüm bilgisi bulunamadı. ` +
              `Mevcut kolonlar: ${Object.keys(item).join(', ')}. ` +
              `Lütfen CSV dosyanızda "bolumid", "bolumkod" veya "bolumad" kolonlarından birini ekleyin ve doldurun.`
            );
          }

          return result;
        });
      } else if (activeTab === 'rooms') {
        transformedData = parseData.map((item) => {
          // Tip değerini normalize et - sadece küçük harfe çevir ve Türkçe karakterleri normalize et
          const tipValue = String(item.tip || '')
            .trim()
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');

          // Geçerli enum değerleri: 'amfi', 'laboratuvar', 'sinif', 'toplanti', 'diger'
          const gecerliTipler = ['amfi', 'laboratuvar', 'sinif', 'toplanti', 'diger'];
          const normalizedTip = gecerliTipler.includes(tipValue) ? tipValue : 'diger';

          return {
            ad: item.ad,
            bina: item.bina,
            tip: normalizedTip,
            kapasite: parseInt(item.kapasite, 10),
          };
        });
      } else if (activeTab === 'departments') {
        // Debug: İlk birkaç satırı kontrol et
        if (parseData.length > 0) {
          console.log('🔍 TRANSFORM DEBUG 1 - CSV Parse Sonucu (ilk 3 satır):', parseData.slice(0, 3));
          console.log('🔍 TRANSFORM DEBUG 2 - İlk satırın anahtarları:', Object.keys(parseData[0] || {}));
          console.log('🔍 TRANSFORM DEBUG 3 - İlk satırın tüm içeriği:', JSON.stringify(parseData[0], null, 2));
        }

        // Bölümler için transform - parse edilen veriyi direkt kullan, sadece field isimlerini düzelt
        transformedData = parseData.map((item: any, index: number) => {
          console.log(`🔍 TRANSFORM DEBUG ${index + 1} - Ham item:`, JSON.stringify(item, null, 2));
          console.log(`🔍 TRANSFORM DEBUG ${index + 1} - Item type:`, typeof item);
          console.log(`🔍 TRANSFORM DEBUG ${index + 1} - Item keys:`, Object.keys(item || {}));
          console.log(`🔍 TRANSFORM DEBUG ${index + 1} - Item values:`, Object.values(item || {}));

          // Item boş veya null ise hata ver
          if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
            console.error(`🔍 TRANSFORM ERROR ${index + 1} - Boş item!`, item);
            throw new Error(`Satır ${index + 2}: Parse edilen veri boş. CSV dosyanızı kontrol edin.`);
          }

          // Parse edilen veriyi direkt kullan, sadece field isimlerini normalize et
          // CSV parsing zaten küçük harfe çevirdi (ad, kod, fakultekod)
          const result: any = {
            ad: String(item.ad || item['ad'] || '').trim(),
            kod: String(item.kod || item['kod'] || '').trim(),
          };

          // Ad ve kod zorunlu
          if (!result.ad || !result.kod) {
            console.error(`🔍 TRANSFORM ERROR ${index + 1} - Eksik veri!`, {
              item,
              itemKeys: Object.keys(item),
              result
            });
            throw new Error(
              `Satır ${index + 2}: "ad" veya "kod" alanı boş. ` +
              `Anahtarlar: ${Object.keys(item).join(', ')}. ` +
              `Ham veri: ${JSON.stringify(item)}`
            );
          }

          // FakulteId varsa ekle (küçük harf: fakulteid)
          if (item.fakulteid && String(item.fakulteid).trim()) {
            result.fakulteId = String(item.fakulteid).trim();
          }

          // FakulteKod varsa ekle (küçük harf: fakultekod veya fakultekoc)
          const fakulteKodValue = item.fakultekod || item.fakultekoc || item.fakulteKod;
          if (fakulteKodValue && String(fakulteKodValue).trim()) {
            result.fakulteKod = String(fakulteKodValue).trim();
          }

          // FakulteAd varsa ekle (küçük harf: fakultead)
          if (item.fakultead && String(item.fakultead).trim()) {
            result.fakulteAd = String(item.fakultead).trim();
          }

          // En az bir fakülte bilgisi olmalı
          if (!result.fakulteId && !result.fakulteKod && !result.fakulteAd) {
            throw new Error(
              `Satır ${index + 2}: Bölüm "${result.kod}" için fakülte bilgisi bulunamadı. ` +
              `Mevcut kolonlar: ${Object.keys(item).join(', ')}. ` +
              `Lütfen CSV dosyanızda "fakulteid", "fakultekod" veya "fakultead" kolonlarından birini ekleyin ve doldurun.`
            );
          }

          console.log(`🔍 TRANSFORM DEBUG ${index + 1} - Final result:`, JSON.stringify(result, null, 2));
          return result;
        });

        // Debug: Transform sonrası
        console.log('🔍 TRANSFORM SONRASI - Transform edilmiş veri:', transformedData);
        console.log('🔍 TRANSFORM SONRASI - Transform edilmiş veri sayısı:', transformedData.length);
        if (transformedData.length > 0) {
          console.log('🔍 TRANSFORM SONRASI - İlk satır:', JSON.stringify(transformedData[0], null, 2));
        }
      } else if (activeTab === 'instructors') {
        transformedData = parseData.map((item) => {
          const unvan = item.unvan ? String(item.unvan).trim() : '';
          const ad = String(item.ad || '').trim();
          const tamAd = unvan ? `${unvan} ${ad}` : ad;

          return {
            ad: tamAd,
            email: String(item.email || '').trim(),
            bolumId: item.bolumid ? String(item.bolumid).trim() : undefined,
            bolumKod: item.bolumkod ? String(item.bolumkod).trim() : undefined,
            bolumAd: item.bolumad ? String(item.bolumad).trim() : undefined,
          };
        });
      } else {
        transformedData = parseData;
      }

      // Transform edilmiş veride ad ve kod kontrolü (sadece departments için)
      if (activeTab === 'departments') {
        const invalidData = transformedData.filter((item: any) => !item.ad || !item.kod);
        if (invalidData.length > 0) {
          console.error('Geçersiz veriler:', invalidData);
          throw new Error(
            `${invalidData.length} satırda "ad" veya "kod" eksik. ` +
            `İlk geçersiz satır: ${JSON.stringify(invalidData[0])}. ` +
            `Lütfen CSV dosyanızı kontrol edin.`
          );
        }
      }

      // Veriyi kontrol et
      if (!Array.isArray(transformedData) || transformedData.length === 0) {
        throw new Error('İçe aktarılacak veri bulunamadı.');
      }

      // Veriyi temizle ve direkt gönder (preview olmadan)
      const cleanData = transformedData.map((item: any) => {
        const clean: any = {};

        // Tab'a göre veri temizleme
        if (activeTab === 'rooms') {
          // Rooms için zorunlu alanlar
          if (item.ad) clean.ad = String(item.ad).trim();
          if (item.bina) clean.bina = String(item.bina).trim();
          if (item.tip) clean.tip = String(item.tip).trim();
          if (item.kapasite !== undefined && item.kapasite !== null) {
            clean.kapasite = parseInt(String(item.kapasite).trim(), 10);
          }
        } else if (activeTab === 'instructors') {
          // Instructors için zorunlu alanlar
          if (item.ad) clean.ad = String(item.ad).trim();
          if (item.email) clean.email = String(item.email).trim();
          if (item.bolumId) clean.bolumId = String(item.bolumId).trim();
          if (item.bolumKod) clean.bolumKod = String(item.bolumKod).trim();
          if (item.bolumAd) clean.bolumAd = String(item.bolumAd).trim();
          if (item.unvan) clean.unvan = String(item.unvan).trim();
        } else if (activeTab === 'faculties') {
          // Faculties için zorunlu alanlar
          if (item.ad) clean.ad = String(item.ad).trim();
          if (item.kod) clean.kod = String(item.kod).trim();
        } else if (activeTab === 'departments') {
          // Departments için zorunlu alanlar
          if (item.ad) clean.ad = String(item.ad).trim();
          if (item.kod) clean.kod = String(item.kod).trim();
          if (item.fakulteId) clean.fakulteId = String(item.fakulteId).trim();
          if (item.fakulteKod) clean.fakulteKod = String(item.fakulteKod).trim();
          if (item.fakulteAd) clean.fakulteAd = String(item.fakulteAd).trim();
        } else if (activeTab === 'courses') {
          // Courses için zorunlu alanlar
          if (item.ad) clean.ad = String(item.ad).trim();
          if (item.kod) clean.kod = String(item.kod).trim();
          if (item.sinif !== undefined && item.sinif !== null) clean.sinif = parseInt(String(item.sinif).trim(), 10);
          if (item.donem) clean.donem = String(item.donem).trim();
          if (item.bolumId) clean.bolumId = String(item.bolumId).trim();
          if (item.bolumKod) clean.bolumKod = String(item.bolumKod).trim();
          if (item.bolumkod) clean.bolumKod = String(item.bolumkod).trim();
          if (item.bolumAd) clean.bolumAd = String(item.bolumAd).trim();
          if (item.bolumad) clean.bolumAd = String(item.bolumad).trim();
          if (item.kredi !== undefined && item.kredi !== null) clean.kredi = parseInt(String(item.kredi).trim(), 10);
          if (item.ogrenciKapasitesi !== undefined && item.ogrenciKapasitesi !== null) clean.ogrenciKapasitesi = parseInt(String(item.ogrenciKapasitesi).trim(), 10);
          if (item.ogrencikapasitesi !== undefined && item.ogrencikapasitesi !== null) clean.ogrenciKapasitesi = parseInt(String(item.ogrencikapasitesi).trim(), 10);
        }

        return clean;
      }).filter((item: any) => {
        // Tab'a göre filtreleme - zorunlu alanları kontrol et
        if (activeTab === 'rooms') {
          return item.ad && item.bina && item.tip && item.kapasite;
        } else if (activeTab === 'instructors') {
          return item.ad && item.email && (item.bolumId || item.bolumKod || item.bolumAd);
        } else if (activeTab === 'faculties') {
          return item.ad && item.kod;
        } else if (activeTab === 'departments') {
          return item.ad && item.kod;
        } else if (activeTab === 'courses') {
          return item.ad && item.kod && item.sinif && item.donem;
        }
        return true;
      });

      console.log('🔍 DIRECT IMPORT - Temizlenmiş veri:', JSON.stringify(cleanData.slice(0, 2), null, 2));
      console.log('🔍 DIRECT IMPORT - Veri sayısı:', cleanData.length);

      if (cleanData.length === 0) {
        throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
      }

      // Önizleme için veriyi kaydet ve dialog'u göster
      // Headers'ı sıralı bir şekilde oluştur (courses için özel sıralama)
      let previewHeadersList: string[] = [];
      if (cleanData.length > 0) {
        if (activeTab === 'courses') {
          // Courses için belirli bir sıraya göre headers oluştur
          const orderedHeaders = ['kod', 'ad', 'sinif', 'donem', 'bolumId', 'bolumKod', 'bolumAd', 'kredi', 'ogrenciKapasitesi'];
          const availableHeaders = Object.keys(cleanData[0]);
          // Önce sıralı headers'ları ekle, sonra diğerlerini ekle
          previewHeadersList = [
            ...orderedHeaders.filter(h => availableHeaders.includes(h)),
            ...availableHeaders.filter(h => !orderedHeaders.includes(h))
          ];
        } else if (activeTab === 'departments') {
          // Departments için belirli bir sıraya göre headers oluştur
          const orderedHeaders = ['ad', 'kod', 'fakulteId', 'fakulteKod', 'fakulteAd'];
          const availableHeaders = Object.keys(cleanData[0]);
          previewHeadersList = [
            ...orderedHeaders.filter(h => availableHeaders.includes(h)),
            ...availableHeaders.filter(h => !orderedHeaders.includes(h))
          ];
        } else {
          // Diğer tab'lar için normal sıralama
          previewHeadersList = Object.keys(cleanData[0]);
        }
      }
      setPreviewHeaders(previewHeadersList);
      setPreviewData(cleanData);
      setPendingImportMutation(importMutation);
      setPreviewActiveTab(activeTab); // Active tab'ı kaydet
      setShowImportDialog(false); // Import dialog'u kapat
      // Preview dialog otomatik açılacak (previewData set edildiğinde)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'CSV dosyası işlenirken hata oluştu.',
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      switch (activeTab) {
        case 'faculties':
          await deleteFacultyMutation.mutateAsync(id);
          break;
        case 'departments':
          await deleteDepartmentMutation.mutateAsync(id);
          break;
        case 'courses':
          await deleteCourseMutation.mutateAsync(id);
          break;
        case 'rooms':
          await deleteRoomMutation.mutateAsync(id);
          break;
        case 'instructors':
          await deleteInstructorMutation.mutateAsync(id);
          break;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu.');
    }
  };

  const getCSVHeaders = () => {
    switch (activeTab) {
      case 'faculties':
        return 'ad, kod';
      case 'departments':
        return 'ad, kod, fakultekod (veya fakulteid veya fakultead) - Örnek: ad, kod, fakultekod';
      case 'courses':
        return 'kod, ad, sinif, donem (güz/bahar), bolumid/bolumkod/bolumad (biri gerekli), kredi (opsiyonel), ogrencikapasitesi (opsiyonel)';
      case 'rooms':
        return 'ad, bina, tip (amfi/laboratuvar/sınıf/toplantı/diğer), kapasite';
      case 'instructors':
        return 'ad, email, bolumkod (veya bolumid veya bolumad)';
      default:
        return '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Veri Yönetimi
          </h1>
          <p className="text-muted-foreground">
            Fakülte, bölüm, derslik, ders ve öğretim üyesi kayıtlarının merkezi yönetimi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.open('/api-docs', '_blank')}
          >
            API Dokümantasyonu
          </Button>
          <Button
            onClick={() => {
              setSearch('');
            }}
          >
            Aramayı Temizle
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted/80'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'departments' && facultiesResponse?.veriler && facultiesResponse.veriler.length > 0 && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 CSV İçe Aktarma Formatı
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200 mb-2">
            <strong>Gerekli Kolonlar:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">kod</code>
            <br />
            <strong>Fakülte Bilgisi:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">fakulteid</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">fakultekod</code> veya
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">fakultead</code> kolonlarından birini kullanabilirsiniz.
            <br />
            <strong>Örnek Satır:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">Bilgisayar Mühendisliği;BIL;MF</code>
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Mevcut Fakülteler:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {facultiesResponse.veriler.map((f) => (
                <li key={f.id}>
                  <strong>{f.ad}</strong> - Kod: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{f.kod}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'courses' && departments && departments.length > 0 && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 CSV İçe Aktarma Formatı
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200 mb-2 space-y-1">
            <div>
              <strong>Gerekli Kolonlar:</strong>
              <ul className="list-disc list-inside ml-2 mt-0.5">
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">kod</code> - Ders kodu (örn: MAT101)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad</code> - Ders adı (örn: Matematik I)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">sinif</code> - Sınıf (1-6 arası sayı)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">donem</code> - Dönem (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">güz</code> veya <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bahar</code>)</li>
              </ul>
            </div>
            <div>
              <strong>Bölüm Bilgisi (Gerekli - Üçünden Biri):</strong>
              <ul className="list-disc list-inside ml-2 mt-0.5">
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumid</code> - Bölüm UUID'si</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumkod</code> - Bölüm kodu (önerilen, örn: BIL)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumad</code> - Bölüm adı</li>
              </ul>
            </div>
            <div>
              <strong>Opsiyonel Kolonlar:</strong>
              <ul className="list-disc list-inside ml-2 mt-0.5">
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">kredi</code> - Ders kredisi (pozitif sayı)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ogrencikapasitesi</code> veya <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ogrenciKapasitesi</code> - Öğrenci kapasitesi (pozitif sayı, örn: 50)</li>
              </ul>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-700">
              <strong>Örnek CSV Başlık Satırı:</strong>
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded block mt-1 p-1">kod;ad;sinif;donem;bolumkod;kredi;ogrencikapasitesi</code>
            </div>
            <div className="mt-1">
              <strong>Örnek Veri Satırı:</strong>
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded block mt-1 p-1">MAT101;Matematik I;1;güz;BIL;3;50</code>
            </div>
            <div className="mt-1 text-[10px] text-blue-700 dark:text-blue-300">
              <strong>Not:</strong> CSV dosyasında ayırıcı olarak noktalı virgül (<code className="bg-blue-100 dark:bg-blue-900 px-0.5 rounded">;</code>) kullanılmalıdır. Excel'den kaydederken "CSV (Noktalı Virgülle Ayrılmış)" formatını seçin.
            </div>
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200 mt-3">
            <strong>Mevcut Bölümler:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 max-h-40 overflow-y-auto">
              {departments.map((d) => (
                <li key={d.id}>
                  <strong>{d.ad}</strong> - Kod: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{d.kod}</code>
                  {d.fakulte && ` (Fakülte: ${d.fakulte.ad})`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'instructors' && departments && departments.length > 0 && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 CSV İçe Aktarma Formatı
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200 mb-2">
            <strong>Gerekli Kolonlar:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">email</code>
            <br />
            <strong>Bölüm Bilgisi (Birisi Gerekli):</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumkod</code> veya
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumad</code>
            <br />
            <span className="text-red-600 dark:text-red-400 font-bold">⚠️ Önemli:</span> CSV'deki <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bolumid</code> (UUID) değerleri veritabanı ile eşleşmeyebilir. Lütfen bunun yerine aşağıda listelenen <strong>Kodları</strong> kullanın.
            <br />
            <strong>Örnek Satır:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad,email,bolumkod,unvan</code>
            <br />
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded block mt-1">Ahmet Yılmaz;ahmet@istun.edu.tr;BM;Dr. Öğr. Üyesi</code>
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Mevcut Bölümler:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 max-h-40 overflow-y-auto">
              {departments.map((d) => (
                <li key={d.id}>
                  <strong>{d.ad}</strong> - Kod: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{d.kod}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && facultiesResponse?.veriler && facultiesResponse.veriler.length > 0 && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 CSV İçe Aktarma Formatı
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200 mb-2">
            <strong>Gerekli Kolonlar:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bina</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">tip</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">kapasite</code>,
            <br />
            <strong>Tip:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">amfi</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">laboratuvar</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">sınıf</code>,
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">toplantı</code> veya
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">diğer</code>
            <br />
            <strong>Örnek Satır:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ad;bina;tip;kapasite</code>
            <br />
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded block mt-1">A-101;A Blok;amfi;150</code>
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Not:</strong> Derslikler fakülteye bağlı değildir, tüm fakülteler tarafından kullanılabilir.
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {TABS.find((tab) => tab.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-muted-foreground">{tabDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="h-9 rounded-md border bg-background px-3 py-1 text-sm"
              placeholder="Ara..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportDialog(true);
                setImportError(null);
                setImportSuccess(null);
              }}
            >
              CSV İçe Aktar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => {
                setEditingItem(null);
                setShowAddDialog(true);
              }}
            >
              Yeni Kayıt Ekle
            </Button>
          </div>
        </div>

        {loading ? (
          <Placeholder message="Veriler yükleniyor…" />
        ) : errored ? (
          <Placeholder
            message={
              facultiesErrorObj instanceof Error
                ? facultiesErrorObj.message
                : 'Veriler yüklenirken sorun oluştu.'
            }
          />
        ) : activeList.length === 0 ? (
          <Placeholder message="Kriterlere uyan kayıt bulunmadı." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <TableHeader activeTab={activeTab} />
              </thead>
              <tbody className="divide-y">
                {activeList.map((item) => (
                  <TableRow
                    key={item.id}
                    activeTab={activeTab}
                    item={item}
                    onDelete={handleDelete}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowAddDialog(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Forms */}
      {activeTab === 'faculties' && (
        <AddFacultyForm
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingItem(null);
          }}
          initialData={editingItem as Faculty | null}
        />
      )}
      {activeTab === 'departments' && (
        <AddDepartmentForm
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingItem(null);
          }}
          initialData={editingItem as Department | null}
        />
      )}
      {activeTab === 'courses' && (
        <AddCourseForm
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingItem(null);
          }}
          initialData={editingItem as Course | null}
        />
      )}
      {activeTab === 'rooms' && (
        <AddRoomForm
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingItem(null);
          }}
          initialData={editingItem as Room | null}
        />
      )}
      {activeTab === 'instructors' && (
        <AddInstructorForm
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingItem(null);
          }}
          initialData={editingItem as Instructor | null}
        />
      )}

      {/* CSV Import Dialog */}
      {/* Preview Dialog */}
      <Dialog open={previewData !== null} onOpenChange={(open) => {
        if (!open) {
          setPreviewData(null);
          setPreviewHeaders([]);
          setPendingImportMutation(null);
          setPreviewActiveTab(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>CSV Önizleme - Veritabanına Göndermeden Önce Kontrol Edin</DialogTitle>
            <DialogDescription>
              CSV dosyanızdan {previewData?.length || 0} satır okundu. Lütfen verileri kontrol edin ve onayladıktan sonra veritabanına gönderin.
            </DialogDescription>
          </DialogHeader>

          {previewData && previewData.length > 0 && (
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="min-w-full divide-y text-sm">
                <thead className="bg-muted/40 text-muted-foreground sticky top-0">
                  <tr>
                    {previewHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left font-medium capitalize"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      {previewHeaders.map((header) => {
                        const value = row[header];
                        // Değeri göster - null, undefined veya boş string ise '-' göster
                        const displayValue = (value === null || value === undefined || value === '') ? '-' : String(value);
                        return (
                          <td key={header} className="px-4 py-2">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setPreviewData(null);
                setPreviewHeaders([]);
                setPendingImportMutation(null);
                setPreviewActiveTab(null);
              }}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log('🔍 BUTON TIKLANDI - previewData:', previewData);
                console.log('🔍 BUTON TIKLANDI - previewActiveTab:', previewActiveTab);
                console.log('🔍 BUTON TIKLANDI - pendingImportMutation:', pendingImportMutation);

                if (!previewData) {
                  console.error('🔍 PREVIEW ERROR - previewData yok!', {
                    previewData,
                    previewActiveTab
                  });
                  alert('Önizleme verisi bulunamadı. Lütfen CSV dosyanızı tekrar yükleyin.');
                  return;
                }

                // Courses için pendingImportMutation gerekmez, direkt importCourses kullanıyoruz
                if (previewActiveTab !== 'courses' && !pendingImportMutation) {
                  console.error('🔍 PREVIEW ERROR - pendingImportMutation yok!', {
                    previewData,
                    pendingImportMutation,
                    previewActiveTab
                  });
                  alert('İçe aktarma fonksiyonu bulunamadı. Lütfen sayfayı yenileyin.');
                  return;
                }

                try {
                  setImportError(null);
                  setImportSuccess(null);

                  // Debug: Gönderilecek veriyi kontrol et
                  console.log('🔍 PREVIEW GÖNDERİM - previewData:', previewData);
                  console.log('🔍 PREVIEW GÖNDERİM - previewData length:', previewData.length);
                  console.log('🔍 PREVIEW GÖNDERİM - previewData type:', typeof previewData);
                  console.log('🔍 PREVIEW GÖNDERİM - previewData Array mi?', Array.isArray(previewData));

                  if (previewData.length > 0) {
                    console.log('🔍 PREVIEW GÖNDERİM - İlk satır:', JSON.stringify(previewData[0], null, 2));
                    console.log('🔍 PREVIEW GÖNDERİM - İlk satırın keys:', Object.keys(previewData[0]));
                    console.log('🔍 PREVIEW GÖNDERİM - İlk satırın ad:', previewData[0].ad);
                    console.log('🔍 PREVIEW GÖNDERİM - İlk satırın kod:', previewData[0].kod);
                    console.log('🔍 PREVIEW GÖNDERİM - İlk satırın fakulteKod:', previewData[0].fakulteKod);
                  }

                  // Veriyi kontrol et
                  if (previewData.length === 0) {
                    throw new Error('İçe aktarılacak veri bulunamadı.');
                  }

                  // Her kaydı kontrol et
                  previewData.forEach((item: any, index: number) => {
                    if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
                      console.error(`🔍 PREVIEW ERROR - Boş kayıt ${index + 1}:`, item);
                      throw new Error(`Satır ${index + 1}: Geçersiz veri formatı.`);
                    }
                    if (previewActiveTab === 'departments' && (!item.ad || !item.kod)) {
                      console.error(`🔍 PREVIEW ERROR - Eksik veri ${index + 1}:`, item);
                      throw new Error(`Satır ${index + 1}: "ad" veya "kod" eksik.`);
                    }
                  });

                  // Veriyi kontrol et - previewData boş olmamalı
                  console.log('🔍 PREVIEW GÖNDERİM - previewData (orijinal):', previewData);
                  console.log('🔍 PREVIEW GÖNDERİM - previewData type:', typeof previewData);
                  console.log('🔍 PREVIEW GÖNDERİM - previewData Array mi?', Array.isArray(previewData));
                  console.log('🔍 PREVIEW GÖNDERİM - previewData length:', previewData?.length);

                  if (!previewData || !Array.isArray(previewData) || previewData.length === 0) {
                    console.error('🔍 PREVIEW ERROR - previewData boş veya geçersiz!', previewData);
                    throw new Error('Önizleme verisi bulunamadı. Lütfen CSV dosyanızı tekrar yükleyin.');
                  }

                  // İlk satırı kontrol et
                  if (previewData[0]) {
                    console.log('🔍 PREVIEW GÖNDERİM - previewData[0]:', JSON.stringify(previewData[0], null, 2));
                    console.log('🔍 PREVIEW GÖNDERİM - previewData[0] keys:', Object.keys(previewData[0]));
                    console.log('🔍 PREVIEW GÖNDERİM - previewData[0] values:', Object.values(previewData[0]));
                  }

                  // Veriyi kopyala - JSON parse/stringify ile deep copy yap
                  // Önce previewData'yı kontrol et
                  console.log('🔍 PREVIEW GÖNDERİM - previewData (kopyalamadan önce):', JSON.stringify(previewData.slice(0, 2), null, 2));
                  console.log('🔍 PREVIEW GÖNDERİM - previewData[0] keys:', previewData[0] ? Object.keys(previewData[0]) : 'yok');
                  console.log('🔍 PREVIEW GÖNDERİM - previewData[0] values:', previewData[0] ? Object.values(previewData[0]) : 'yok');
                  console.log('🔍 PREVIEW GÖNDERİM - previewData[0].fakulteKod:', previewData[0]?.fakulteKod);

                  // Veriyi kopyala ve fakulteKod'u kontrol et
                  const dataToSend = previewData.map((item: any) => {
                    const copy: any = {};
                    // Tüm key'leri kopyala
                    Object.keys(item).forEach(key => {
                      copy[key] = item[key];
                    });
                    return copy;
                  });

                  console.log('🔍 PREVIEW GÖNDERİM - dataToSend (kopya):', JSON.stringify(dataToSend.slice(0, 2), null, 2));
                  console.log('🔍 PREVIEW GÖNDERİM - dataToSend length:', dataToSend.length);
                  console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0] keys:', dataToSend[0] ? Object.keys(dataToSend[0]) : 'yok');
                  console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0] values:', dataToSend[0] ? Object.values(dataToSend[0]) : 'yok');
                  console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0].fakulteKod:', dataToSend[0]?.fakulteKod);
                  console.log('🔍 PREVIEW GÖNDERİM - previewActiveTab:', previewActiveTab);
                  console.log('🔍 PREVIEW GÖNDERİM - pendingImportMutation:', pendingImportMutation);
                  console.log('🔍 PREVIEW GÖNDERİM - pendingImportMutation type:', typeof pendingImportMutation);
                  console.log('🔍 PREVIEW GÖNDERİM - pendingImportMutation.mutateAsync:', typeof pendingImportMutation?.mutateAsync);

                  // Veriyi tekrar kontrol et
                  if (dataToSend.length > 0) {
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0]:', JSON.stringify(dataToSend[0], null, 2));
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0].ad:', dataToSend[0]?.ad);
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0].kod:', dataToSend[0]?.kod);
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0].fakulteKod:', dataToSend[0]?.fakulteKod);
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0] keys:', Object.keys(dataToSend[0]));
                    console.log('🔍 PREVIEW GÖNDERİM - dataToSend[0] values:', Object.values(dataToSend[0]));
                  }

                  // Mutation fonksiyonunu kontrol et
                  if (!pendingImportMutation || typeof pendingImportMutation.mutateAsync !== 'function') {
                    console.error('🔍 PREVIEW ERROR - Mutation fonksiyonu geçersiz!', pendingImportMutation);
                    throw new Error('İçe aktarma fonksiyonu bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
                  }

                  // Veriyi tekrar kontrol et - boş olmamalı
                  if (!dataToSend || dataToSend.length === 0) {
                    console.error('🔍 PREVIEW ERROR - dataToSend boş!', dataToSend);
                    throw new Error('Gönderilecek veri bulunamadı.');
                  }

                  // Her kaydı kontrol et
                  dataToSend.forEach((item: any, index: number) => {
                    if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
                      console.error(`🔍 PREVIEW ERROR - Boş kayıt ${index + 1}:`, item);
                      throw new Error(`Satır ${index + 1}: Geçersiz veri formatı.`);
                    }
                  });

                  console.log('🔍 PREVIEW GÖNDERİM - mutateAsync çağrılıyor...');
                  console.log('🔍 PREVIEW GÖNDERİM - Gönderilecek veri sayısı:', dataToSend.length);
                  console.log('🔍 PREVIEW GÖNDERİM - Gönderilecek veri (tamamı):', JSON.stringify(dataToSend, null, 2));

                  // Son kontrol - her kaydın gerekli alanları olmalı
                  dataToSend.forEach((item: any, index: number) => {
                    console.log(`🔍 PREVIEW GÖNDERİM - Kayıt ${index + 1}:`, JSON.stringify(item, null, 2));
                    if (previewActiveTab === 'courses') {
                      if (!item.kod || !item.ad || !item.sinif || !item.donem) {
                        console.error(`🔍 PREVIEW ERROR - Kayıt ${index + 1} eksik!`, item);
                        throw new Error(`Satır ${index + 1}: "kod", "ad", "sinif" veya "donem" eksik. Veri: ${JSON.stringify(item)}`);
                      }
                    } else if (previewActiveTab === 'departments') {
                      if (!item.ad || !item.kod) {
                        console.error(`🔍 PREVIEW ERROR - Kayıt ${index + 1} eksik!`, item);
                        throw new Error(`Satır ${index + 1}: "ad" veya "kod" eksik. Veri: ${JSON.stringify(item)}`);
                      }
                    } else if (previewActiveTab === 'rooms') {
                      if (!item.ad || !item.bina || !item.tip || !item.kapasite) {
                        console.error(`🔍 PREVIEW ERROR - Kayıt ${index + 1} eksik!`, item);
                        throw new Error(`Satır ${index + 1}: "ad", "bina", "tip" veya "kapasite" eksik. Veri: ${JSON.stringify(item)}`);
                      }
                    } else if (previewActiveTab === 'instructors') {
                      if (!item.ad || !item.email || !item.bolumId) {
                        console.error(`🔍 PREVIEW ERROR - Kayıt ${index + 1} eksik!`, item);
                        throw new Error(`Satır ${index + 1}: "ad", "email" veya "bolumId" eksik. Veri: ${JSON.stringify(item)}`);
                      }
                    } else if (previewActiveTab === 'faculties') {
                      if (!item.ad || !item.kod) {
                        console.error(`🔍 PREVIEW ERROR - Kayıt ${index + 1} eksik!`, item);
                        throw new Error(`Satır ${index + 1}: "ad" veya "kod" eksik. Veri: ${JSON.stringify(item)}`);
                      }
                    }
                  });

                  // Veriyi temizle ve direkt API'ye gönder (mutation sorununu bypass et)
                  console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturulmadan önce dataToSend[0]:', JSON.stringify(dataToSend[0], null, 2));
                  console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturulmadan önce dataToSend[0] keys:', Object.keys(dataToSend[0] || {}));
                  console.log('🔍 PREVIEW GÖNDERİM - previewActiveTab:', previewActiveTab);

                  let result;

                  if (previewActiveTab === 'courses') {
                    // Courses için finalData oluştur
                    const finalData = dataToSend.map((item: any) => {
                      // Tüm olası key varyasyonlarını kontrol et
                      const kodValue = item.kod || item['kod'] || item.KOD || item['KOD'];
                      const adValue = item.ad || item['ad'] || item.AD || item['AD'];
                      const sinifValue = item.sinif || item['sinif'] || item.SINIF || item['SINIF'];
                      const donemValue = item.donem || item['donem'] || item.DONEM || item['DONEM'];

                      // Eğer hala bulunamadıysa, tüm key'leri kontrol et (case-insensitive)
                      let sinifFound = sinifValue;
                      let donemFound = donemValue;

                      if (!sinifFound) {
                        const sinifKey = Object.keys(item || {}).find(k => k.toLowerCase() === 'sinif');
                        if (sinifKey) sinifFound = item[sinifKey];
                      }

                      if (!donemFound) {
                        const donemKey = Object.keys(item || {}).find(k => k.toLowerCase() === 'donem');
                        if (donemKey) donemFound = item[donemKey];
                      }

                      const clean: any = {
                        kod: String(kodValue || '').trim(),
                        ad: String(adValue || '').trim(),
                        sinif: sinifFound ? parseInt(String(sinifFound).trim(), 10) : 0,
                        donem: donemFound ? (String(donemFound).toLowerCase().trim() === 'güz' || String(donemFound).toLowerCase().trim() === 'guz' ? 'guz' : 'bahar') : 'guz',
                      };

                      // Bölüm bilgileri (en az biri olmalı)
                      if (item.bolumId) clean.bolumId = String(item.bolumId).trim();
                      if (item.bolumid) clean.bolumId = String(item.bolumid).trim();

                      const bolumKodValue = item.bolumKod || item.bolumkod || item['bolumKod'] || item['bolumkod'];
                      if (bolumKodValue && String(bolumKodValue).trim()) {
                        clean.bolumKod = String(bolumKodValue).trim();
                      }

                      if (item.bolumAd || item.bolumad) {
                        clean.bolumAd = String(item.bolumAd || item.bolumad).trim();
                      }

                      // Kredi bilgisi
                      if (item.kredi && String(item.kredi).trim()) {
                        const krediValue = parseInt(String(item.kredi).trim(), 10);
                        if (!isNaN(krediValue) && krediValue > 0) {
                          clean.kredi = krediValue;
                        }
                      }

                      // Öğrenci kapasitesi bilgisi
                      const kapasiteValue = item.ogrencikapasitesi || item.ogrenciKapasitesi || item.kapasite || item['ogrencikapasitesi'] || item['ogrenciKapasitesi'] || item['kapasite'];
                      if (kapasiteValue && String(kapasiteValue).trim()) {
                        const kapasiteInt = parseInt(String(kapasiteValue).trim(), 10);
                        if (!isNaN(kapasiteInt) && kapasiteInt > 0) {
                          clean.ogrenciKapasitesi = kapasiteInt;
                        }
                      }

                      console.log('🔍 PREVIEW GÖNDERİM - finalData item (courses):', JSON.stringify(clean, null, 2));
                      return clean;
                    }).filter((item: any) => item.kod && item.ad && item.sinif && item.donem);

                    console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturuldu (courses), ilk kayıt:', JSON.stringify(finalData[0], null, 2));

                    if (finalData.length === 0) {
                      throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
                    }

                    // Direkt API çağrısı yap (mutation sorununu bypass et)
                    result = await importCourses(finalData);

                    // Query cache'i invalidate et
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  } else if (previewActiveTab === 'departments') {
                    // Departments için finalData oluştur
                    const finalData = dataToSend.map((item: any) => {
                      const clean: any = {};
                      // Ad ve kod zorunlu
                      clean.ad = String(item.ad || '').trim();
                      clean.kod = String(item.kod || '').trim();

                      // Fakülte bilgileri (en az biri olmalı) - tüm olası şekilleri kontrol et
                      if (item.fakulteId) clean.fakulteId = String(item.fakulteId).trim();
                      if (item.fakulteid) clean.fakulteId = String(item.fakulteid).trim();

                      // FakulteKod için tüm olası şekilleri kontrol et
                      const fakulteKodValue = item.fakulteKod || item.fakultekod || item.fakultekoc || item['fakulteKod'] || item['fakultekod'] || item['fakultekoc'];
                      if (fakulteKodValue && String(fakulteKodValue).trim()) {
                        clean.fakulteKod = String(fakulteKodValue).trim();
                      }

                      if (item.fakulteAd) clean.fakulteAd = String(item.fakulteAd).trim();
                      if (item.fakultead) clean.fakulteAd = String(item.fakultead).trim();

                      console.log('🔍 PREVIEW GÖNDERİM - finalData item (departments):', JSON.stringify(clean, null, 2));
                      return clean;
                    }).filter((item: any) => item.ad && item.kod);

                    console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturuldu (departments), ilk kayıt:', JSON.stringify(finalData[0], null, 2));
                    console.log('🔍 PREVIEW GÖNDERİM - finalData[0] fakulteKod:', finalData[0]?.fakulteKod);

                    if (finalData.length === 0) {
                      throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
                    }

                    // Direkt API çağrısı yap (mutation sorununu bypass et)
                    result = await importDepartments(finalData);

                    // Query cache'i invalidate et
                    queryClient.invalidateQueries({ queryKey: ['departments'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  } else if (previewActiveTab === 'rooms') {
                    // Rooms için finalData oluştur
                    const finalData = dataToSend.map((item: any) => {
                      const clean: any = {};
                      // Rooms için zorunlu alanlar
                      clean.ad = String(item.ad || '').trim();
                      clean.bina = String(item.bina || '').trim();

                      // Tip değerini normalize et - sadece küçük harfe çevir ve Türkçe karakterleri normalize et
                      const tipValue = String(item.tip || '')
                        .trim()
                        .toLowerCase()
                        .replace(/ı/g, 'i')
                        .replace(/ş/g, 's')
                        .replace(/ğ/g, 'g')
                        .replace(/ü/g, 'u')
                        .replace(/ö/g, 'o')
                        .replace(/ç/g, 'c');

                      // Geçerli enum değerleri: 'amfi', 'laboratuvar', 'sinif', 'toplanti', 'diger'
                      const gecerliTipler = ['amfi', 'laboratuvar', 'sinif', 'toplanti', 'diger'];
                      clean.tip = gecerliTipler.includes(tipValue) ? tipValue : 'diger';

                      if (item.kapasite !== undefined && item.kapasite !== null) {
                        clean.kapasite = parseInt(String(item.kapasite).trim(), 10);
                      }

                      console.log(`🔍 PREVIEW TIP NORMALIZE - Orijinal: "${item.tip}", Normalize: "${tipValue}", Sonuç: "${clean.tip}"`);
                      console.log('🔍 PREVIEW GÖNDERİM - finalData item (rooms):', JSON.stringify(clean, null, 2));
                      return clean;
                    }).filter((item: any) => item.ad && item.bina && item.tip && item.kapasite);

                    console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturuldu (rooms), ilk kayıt:', JSON.stringify(finalData[0], null, 2));

                    if (finalData.length === 0) {
                      throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
                    }

                    // Direkt API çağrısı yap (mutation sorununu bypass et)
                    result = await importRooms(finalData);

                    // Query cache'i invalidate et
                    queryClient.invalidateQueries({ queryKey: ['rooms'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  } else if (previewActiveTab === 'faculties') {
                    // Faculties için finalData oluştur
                    const finalData = dataToSend.map((item: any) => {
                      const clean: any = {};
                      // Ad ve kod zorunlu
                      clean.ad = String(item.ad || '').trim();
                      clean.kod = String(item.kod || '').trim();

                      console.log('🔍 PREVIEW GÖNDERİM - finalData item (faculties):', JSON.stringify(clean, null, 2));
                      return clean;
                    }).filter((item: any) => item.ad && item.kod);

                    console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturuldu (faculties), ilk kayıt:', JSON.stringify(finalData[0], null, 2));

                    if (finalData.length === 0) {
                      throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
                    }

                    // Direkt API çağrısı yap
                    result = await importFaculties(finalData);

                    // Query cache'i invalidate et
                    queryClient.invalidateQueries({ queryKey: ['faculties'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  } else if (previewActiveTab === 'instructors') {
                    // Instructors için finalData oluştur
                    const finalData = dataToSend.map((item: any) => {
                      const clean: any = {};
                      // Zorunlu alanlar
                      clean.ad = String(item.ad || '').trim();
                      clean.email = String(item.email || '').trim();
                      clean.bolumId = String(item.bolumId || '').trim();

                      // Roller - CSV'de yoksa varsayılan OGRETIM_UYESI ata
                      // Eğer CSV'de varsa ve virgülle ayrılmışsa diziye çevir
                      if (item.roller) {
                        if (Array.isArray(item.roller)) clean.roller = item.roller;
                        else if (typeof item.roller === 'string') clean.roller = item.roller.split(',').map((r: string) => r.trim());
                      } else {
                        clean.roller = ['OGRETIM_UYESI']; // Varsayılan rol
                      }

                      clean.aktif = true; // Varsayılan aktif

                      console.log('🔍 PREVIEW GÖNDERİM - finalData item (instructors):', JSON.stringify(clean, null, 2));
                      return clean;
                    }).filter((item: any) => item.ad && item.email && item.bolumId);

                    console.log('🔍 PREVIEW GÖNDERİM - finalData oluşturuldu (instructors), ilk kayıt:', JSON.stringify(finalData[0], null, 2));

                    if (finalData.length === 0) {
                      throw new Error('Temizlenmiş veri boş. Lütfen CSV dosyanızı kontrol edin.');
                    }

                    // Direkt API çağrısı yap
                    result = await importInstructors(finalData);

                    // Query cache'i invalidate et
                    queryClient.invalidateQueries({ queryKey: ['instructors'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                  }
                  console.log('🔍 PREVIEW GÖNDERİM - Sonuç:', result);

                  if (!result) {
                    throw new Error('Bu veri türü için içe aktarma henüz desteklenmiyor.');
                  }

                  setImportSuccess(result.mesaj || 'İçe aktarma başarılı.');
                  if (result.uyarilar && result.uyarilar.length > 0) {
                    setImportError(result.uyarilar.join('\n'));
                  }

                  // Preview'ı kapat
                  setPreviewData(null);
                  setPreviewHeaders([]);
                  setPendingImportMutation(null);
                  setPreviewActiveTab(null);
                } catch (error) {
                  console.error('🔍 PREVIEW ERROR - Hata:', error);
                  const errorMessage = error instanceof Error ? error.message : 'CSV dosyası işlenirken hata oluştu.';
                  setImportError(errorMessage);
                  alert(`Hata: ${errorMessage}`);
                }
              }}
              disabled={!previewData || previewData.length === 0}
            >
              Onayla ve Veritabanına Gönder ({previewData?.length || 0} kayıt)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent onClose={() => setShowImportDialog(false)}>
          <DialogHeader>
            <DialogTitle>CSV İçe Aktar</DialogTitle>
            <DialogDescription>
              CSV dosyasını seçin. Gerekli başlıklar: {getCSVHeaders()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                CSV veya TXT dosyası seçin. Dosya seçildikten sonra önizleme ekranı açılacak.
              </p>
              <Button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                Dosya Seç
              </Button>
            </div>
            {importError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-semibold">Hatalar:</p>
                <pre className="mt-1 whitespace-pre-wrap">{importError}</pre>
              </div>
            )}
            {importSuccess && (
              <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300">
                {importSuccess}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                setImportSuccess(null);
              }}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

type EntityItem =
  | (Faculty & { bolumSayisi?: number })
  | (Department & { fakulte?: Faculty })
  | (Course & { bolum?: Department })
  | Room
  | Instructor;

function TableHeader({ activeTab }: { activeTab: TabKey }) {
  switch (activeTab) {
    case 'faculties':
      return (
        <tr>
          <Th>Ad</Th>
          <Th>Kod</Th>
          <Th>Toplam Bölüm</Th>
          <Th>İşlemler</Th>
        </tr>
      );
    case 'departments':
      return (
        <tr>
          <Th>Ad</Th>
          <Th>Kod</Th>
          <Th>Fakülte</Th>
          <Th>İşlemler</Th>
        </tr>
      );
    case 'instructors':
      return (
        <tr>
          <Th>Ad</Th>
          <Th>E-posta</Th>
          <Th>Bölüm</Th>
          <Th>Roller</Th>
          <Th>Durum</Th>
          <Th>İşlemler</Th>
        </tr>
      );
    case 'courses':
      return (
        <tr>
          <Th>Kod</Th>
          <Th>Ad</Th>
          <Th>Bölüm</Th>
          <Th>Sınıf</Th>
          <Th>Dönem</Th>
          <Th>Kredi</Th>
          <Th>Öğrenci Kapasitesi</Th>
          <Th>İşlemler</Th>
        </tr>
      );
    case 'rooms':
      return (
        <tr>
          <Th>Ad</Th>
          <Th>Bina</Th>
          <Th>Kapasite</Th>
          <Th>Tip</Th>
          <Th>İşlemler</Th>
        </tr>
      );
    default:
      return null;
  }
}

function TableRow({
  activeTab,
  item,
  onDelete,
  onEdit,
}: {
  activeTab: TabKey;
  item: EntityItem;
  onDelete: (id: string) => void;
  onEdit: (item: EntityItem) => void;
}) {
  switch (activeTab) {
    case 'faculties': {
      const faculty = item as Faculty & { bolumSayisi?: number };
      return (
        <tr className="hover:bg-muted/40">
          <Td>{faculty.ad}</Td>
          <Td>{faculty.kod}</Td>
          <Td>{faculty.bolumSayisi ?? '—'}</Td>
          <Td>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(faculty)}
                className="text-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(faculty.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Td>
        </tr>
      );
    }
    case 'departments': {
      const department = item as Department & { fakulte?: Faculty };
      return (
        <tr className="hover:bg-muted/40">
          <Td>{department.ad}</Td>
          <Td>{department.kod}</Td>
          <Td>{department.fakulte?.ad ?? '—'}</Td>
          <Td>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(department)}
                className="text-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(department.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Td>
        </tr>
      );
    }
    case 'instructors': {
      const instructor = item as Instructor;
      const roles = Array.isArray(instructor.roller)
        ? instructor.roller
        : [];
      return (
        <tr className="hover:bg-muted/40">
          <Td>{instructor.ad}</Td>
          <Td>{instructor.email ?? '—'}</Td>
          <Td>{instructor.bolum?.ad ?? '—'}</Td>
          <Td>
            <div className="flex flex-wrap gap-1">
              {roles.length === 0 ? (
                <Badge variant="secondary">Rol atanmamış</Badge>
              ) : (
                roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {formatRole(role)}
                  </Badge>
                ))
              )}
            </div>
          </Td>
          <Td>
            <Badge variant={instructor.aktif ? 'success' : 'destructive'}>
              {instructor.aktif ? 'Aktif' : 'Pasif'}
            </Badge>
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(instructor)}
                className="text-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(instructor.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Td>
        </tr>
      );
    }
    case 'courses': {
      const course = item as Course & { bolum?: Department };
      return (
        <tr className="hover:bg-muted/40">
          <Td>{course.kod}</Td>
          <Td>{course.ad}</Td>
          <Td>{course.bolum?.ad ?? '—'}</Td>
          <Td>{course.sinif ?? '—'}</Td>
          <Td>{course.donem ?? '—'}</Td>
          <Td>{course.kredi ?? '—'}</Td>
          <Td>{course.ogrenciKapasitesi ?? '—'}</Td>
          <Td>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(course)}
                className="text-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(course.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Td>
        </tr>
      );
    }
    case 'rooms': {
      const room = item as Room;
      return (
        <tr className="hover:bg-muted/40">
          <Td>{room.ad}</Td>
          <Td>{room.bina ?? '—'}</Td>
          <Td>{room.kapasite ?? '—'}</Td>
          <Td className="uppercase">{room.tip}</Td>
          <Td>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(room)}
                className="text-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(room.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Td>
        </tr>
      );
    }
    default:
      return null;
  }
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="px-6 py-16 text-center text-muted-foreground">{message}</div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-6 py-3 text-left text-xs font-semibold uppercase',
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-6 py-4 align-top text-sm', className)}>{children}</td>
  );
}

function filterFaculties(faculties: Faculty[], search: string) {
  if (!search) return faculties;
  return faculties.filter((faculty) =>
    faculty.ad.toLowerCase().includes(search) ||
    faculty.kod.toLowerCase().includes(search),
  );
}

function filterDepartments(departments: Department[], search: string) {
  if (!search) return departments;
  return departments.filter((department) => {
    const target = `${department.ad} ${department.kod} ${department.fakulte?.ad ?? ''}`.toLowerCase();
    return target.includes(search);
  });
}

function filterInstructors(instructors: Instructor[], search: string) {
  if (!search) return instructors;
  return instructors.filter((instructor) => {
    const target = `${instructor.ad} ${instructor.email ?? ''} ${instructor.bolum?.ad ?? ''}`.toLowerCase();
    return target.includes(search);
  });
}

function filterCourses(courses: Course[], search: string) {
  if (!search) return courses;
  return courses.filter((course) => {
    const target = `${course.kod} ${course.ad} ${course.bolum?.ad ?? ''} ${course.donem ?? ''}`.toLowerCase();
    return target.includes(search);
  });
}

function filterRooms(rooms: Room[], search: string) {
  if (!search) return rooms;
  return rooms.filter((room) => {
    const target = `${room.ad} ${room.bina ?? ''} ${room.tip ?? ''}`.toLowerCase();
    return target.includes(search);
  });
}

function formatRole(role: string) {
  switch (role) {
    case 'YONETICI':
      return 'Yönetici';
    case 'BOLUM_SORUMLUSU':
      return 'Bölüm Sorumlusu';
    case 'OGRETIM_UYESI':
      return 'Öğretim Üyesi';
    default:
      return role;
  }
}

