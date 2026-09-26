import { AutoReplyRule } from '../types/rule';

export const INITIAL_RULES: AutoReplyRule[] = [
  {
    id: 'rule_1',
    keyword: 'halo',
    response: 'Halo! Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu hari ini? Silakan ketik kata kunci seperti: "harga", "lokasi", atau "jam operasional".',
    matchType: 'contains',
    caseSensitive: false,
    enabled: true,
    notes: 'Menyapa pesan pembuka',
    triggerCount: 0,
  },
  {
    id: 'rule_2',
    keyword: 'harga',
    response: 'Berikut daftar harga produk terlaris kami:\n1. Paket Reguler: Rp 50.000\n2. Paket Premium: Rp 100.000\n3. Paket Komplit: Rp 150.000\n\nUntuk pemesanan langsung, silakan balas dengan format: NAMA_PAKET.',
    matchType: 'contains',
    caseSensitive: false,
    enabled: true,
    notes: 'Katalog & pricelist',
    triggerCount: 0,
  },
  {
    id: 'rule_3',
    keyword: 'lokasi',
    response: 'Toko kami berlokasi di:\n📍 Jl. Merdeka No. 45, Jakarta Pusat\nBuka setiap hari. Tersedia parkir luas untuk motor dan mobil.',
    matchType: 'contains',
    caseSensitive: false,
    enabled: true,
    notes: 'Alamat toko fisik',
    triggerCount: 0,
  },
  {
    id: 'rule_4',
    keyword: 'jam operasional',
    response: '⏰ Jam Operasional Kami:\nSenin - Jumat: 08.00 - 20.00 WIB\nSabtu - Minggu: 09.00 - 17.00 WIB\n\nPesan di luar jam kerja akan dibalas pada hari kerja berikutnya.',
    matchType: 'contains',
    caseSensitive: false,
    enabled: true,
    notes: 'Waktu pelayanan',
    triggerCount: 0,
  },
  {
    id: 'rule_5',
    keyword: 'rekening',
    response: 'Pembayaran dapat ditransfer ke:\n💳 Bank BCA: 123-456-7890 (a/n Fauzi Store)\n💳 Bank Mandiri: 987-654-3210 (a/n Fauzi Store)\n\nSetelah transfer, mohon kirimkan bukti resi ke sini ya. Terima kasih!',
    matchType: 'contains',
    caseSensitive: false,
    enabled: true,
    notes: 'Info rekening pembayaran',
    triggerCount: 0,
  }
];
