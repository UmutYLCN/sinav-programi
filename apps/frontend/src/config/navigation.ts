import * as React from 'react';
import {
  Gauge,
  CalendarClock,
  ClipboardList,
  Users,
  Ban,
  Layers,
} from 'lucide-react';

export type NavItem = {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    description: 'KPI kartları, çakışma uyarıları ve genel görünüm',
    icon: Gauge,
    path: '/',
  },
  {
    title: 'Sınavlar',
    description: 'Manuel sınav planlama ve çakışma kontrolleri',
    icon: ClipboardList,
    path: '/exams',
  },
  {
    title: 'Planım',
    description: 'Gözetmen takvimi, ICS dışa aktarımı',
    icon: CalendarClock,
    path: '/planim',
  },
  {
    title: 'Müsait Değil',
    description: 'Gözetmen müsait değil kayıtları',
    icon: Ban,
    path: '/unavailability',
  },
  {
    title: 'Gözetmen Yükleri',
    description: 'Toplam görev süreleri ve sınav sayıları',
    icon: Users,
    path: '/invigilator-load',
  },
  {
    title: 'Veri Yönetimi',
    description: 'Fakülte, bölüm, ders ve derslik yönetimi',
    icon: Layers,
    path: '/data',
  },
];

