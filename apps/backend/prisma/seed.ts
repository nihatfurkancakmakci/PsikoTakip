import { PrismaClient, Role, PsychologistApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// BAE: her belirti için geçen hafta boyunca ne ölçüde yaşandığını sorgular.
// "şiddet" etiketi yerine yaşanma sıklığı + işlevsellik etkisi tanımlanıyor.
const BAE_OPTIONS = [
  { value: 0, label: 'Bu belirtiyi hiç yaşamadım.' },
  { value: 1, label: 'Fark ettim ama günlük hayatımı etkilemedi.' },
  { value: 2, label: 'Belirgin biçimde yaşadım; rahatsız etti ama üstesinden gelebildim.' },
  { value: 3, label: 'Yoğun biçimde yaşadım; günlük hayatımı güçleştirdi.' },
];

// SCL-90: geçen 7 gün içinde her belirtinin ne sıklıkla yaşandığını sorgular.
// Şiddet değil sıklık odaklı → yanıtlamak daha zor manipüle edilir.
const SCL_OPTIONS = [
  { value: 0, label: 'Hiç yaşamadım.' },
  { value: 1, label: 'Nadiren yaşadım (bir iki kez).' },
  { value: 2, label: 'Zaman zaman yaşadım.' },
  { value: 3, label: 'Sıklıkla yaşadım.' },
  { value: 4, label: 'Neredeyse her gün yaşadım.' },
];

// BDE-II: her soru kendi tanımlayıcı ifadelerine sahip
const BDE_QUESTIONS: { text: string; options: { value: number; label: string }[] }[] = [
  {
    text: 'Üzüntü',
    options: [
      { value: 0, label: 'Kendimi üzgün hissetmiyorum.' },
      { value: 1, label: 'Kendimi çoğu zaman üzgün hissediyorum.' },
      { value: 2, label: 'Sürekli üzgünüm ve bu duygudan kurtulamıyorum.' },
      { value: 3, label: 'Bu kadar üzgün ve mutsuzum ki artık dayanamıyorum.' },
    ],
  },
  {
    text: 'Karamsarlık',
    options: [
      { value: 0, label: 'Geleceğim hakkında umutsuz değilim.' },
      { value: 1, label: 'Eskiye kıyasla daha karamsarım.' },
      { value: 2, label: 'İşlerin düzeleceğini beklemiyorum.' },
      { value: 3, label: 'Geleceğim için hiç umut göremiyorum, işler sadece daha da kötüleşecek.' },
    ],
  },
  {
    text: 'Geçmiş başarısızlıklar',
    options: [
      { value: 0, label: 'Kendimi başarısız görmüyorum.' },
      { value: 1, label: 'Olması gerekenden daha çok başarısız olduğumu hissediyorum.' },
      { value: 2, label: 'Geçmişe baktığımda pek çok başarısızlık görüyorum.' },
      { value: 3, label: 'Kendimi tamamen başarısız biri olarak görüyorum.' },
    ],
  },
  {
    text: 'Zevk alamama',
    options: [
      { value: 0, label: 'Hayattan eskisi kadar zevk alıyorum.' },
      { value: 1, label: 'Eskisi kadar zevk alamıyorum.' },
      { value: 2, label: 'Eskiden keyif aldığım şeylerden artık çok az zevk alıyorum.' },
      { value: 3, label: 'Hiçbir şeyden zevk alamıyorum.' },
    ],
  },
  {
    text: 'Suçluluk duyguları',
    options: [
      { value: 0, label: 'Özellikle suçluluk duymuyorum.' },
      { value: 1, label: 'Yaptığım pek çok şey için kendimi suçlu hissediyorum.' },
      { value: 2, label: 'Çoğu zaman kendimi suçlu hissediyorum.' },
      { value: 3, label: 'Kendimi her zaman suçlu hissediyorum.' },
    ],
  },
  {
    text: 'Cezalandırılma duyguları',
    options: [
      { value: 0, label: 'Cezalandırılacağımı düşünmüyorum.' },
      { value: 1, label: 'Cezalandırılabileceğimi hissediyorum.' },
      { value: 2, label: 'Cezalandırılmayı bekliyorum.' },
      { value: 3, label: 'Cezalandırıldığımı hissediyorum.' },
    ],
  },
  {
    text: 'Kendinden hoşnutsuzluk',
    options: [
      { value: 0, label: 'Kendim hakkında eskisi gibi düşünüyorum.' },
      { value: 1, label: 'Kendime olan güvenim azaldı.' },
      { value: 2, label: 'Kendimden hayal kırıklığı duyuyorum.' },
      { value: 3, label: 'Kendimden nefret ediyorum.' },
    ],
  },
  {
    text: 'Öz eleştiri',
    options: [
      { value: 0, label: 'Kendimi eskisinden daha fazla eleştirmiyorum veya suçlamıyorum.' },
      { value: 1, label: 'Eskiye kıyasla kendimi daha çok eleştiriyorum.' },
      { value: 2, label: 'Yaptığım her şey için kendimi eleştiriyorum.' },
      { value: 3, label: 'Başıma ne kötü şey gelse hepsinin nedeni benim.' },
    ],
  },
  {
    text: 'İntihar düşüncesi veya istekleri',
    options: [
      { value: 0, label: 'Kendimi öldürmeyi ya da hayatıma son vermeyi düşünmüyorum.' },
      { value: 1, label: 'Ölmeyi ya da hayatıma son vermeyi düşünüyorum ama bunları yapmıyorum.' },
      { value: 2, label: 'Kendimi öldürmek istiyorum.' },
      { value: 3, label: 'Fırsatım olsaydı kendimi öldürürdüm.' },
    ],
  },
  {
    text: 'Ağlama',
    options: [
      { value: 0, label: 'Eskisinden daha fazla ağlamıyorum.' },
      { value: 1, label: 'Eskiye göre daha çok ağlıyorum.' },
      { value: 2, label: 'Her şey için ağlıyorum.' },
      { value: 3, label: 'Ağlamak istesem de artık ağlayamıyorum.' },
    ],
  },
  {
    text: 'Ajitasyon',
    options: [
      { value: 0, label: 'Her zamankinden daha huzursuz ya da gergin değilim.' },
      { value: 1, label: 'Her zamankinden biraz daha huzursuz ya da gerginim.' },
      { value: 2, label: 'O kadar huzursuz ya da gerginim ki yerinde duramıyorum.' },
      { value: 3, label: 'O kadar huzursuz ya da gerginim ki hareketsiz durmak ya da sakin olmak zorundayım.' },
    ],
  },
  {
    text: 'İlgi kaybı',
    options: [
      { value: 0, label: 'Diğer insanlara ya da etkinliklere karşı ilgimi kaybetmedim.' },
      { value: 1, label: 'Eskiye kıyasla insanlara ve etkinliklere karşı daha az ilgiliyim.' },
      { value: 2, label: 'İnsanların ve etkinliklerin büyük çoğunluğuna karşı ilgimi yitirdim.' },
      { value: 3, label: 'Her şeye karşı ilgimi yitirdim.' },
    ],
  },
  {
    text: 'Kararsızlık',
    options: [
      { value: 0, label: 'Eskisi kadar iyi karar verebiliyorum.' },
      { value: 1, label: 'Eskiye kıyasla karar vermek benim için daha güç.' },
      { value: 2, label: 'Eskiye kıyasla karar vermek çok daha güç.' },
      { value: 3, label: 'Herhangi bir şeye karar veremiyorum.' },
    ],
  },
  {
    text: 'Değersizlik',
    options: [
      { value: 0, label: 'Kendimi değersiz hissetmiyorum.' },
      { value: 1, label: 'Kendimi eskiye kıyasla daha az değerli hissediyorum.' },
      { value: 2, label: 'Diğer insanlara kıyasla kendimi değersiz hissediyorum.' },
      { value: 3, label: 'Kendimi tamamen değersiz hissediyorum.' },
    ],
  },
  {
    text: 'Enerji kaybı',
    options: [
      { value: 0, label: 'Eskisi kadar enerjim var.' },
      { value: 1, label: 'Eskiye kıyasla daha az enerjim var.' },
      { value: 2, label: 'Pek çok şeyi yapmaya yetecek kadar enerjim yok.' },
      { value: 3, label: 'Herhangi bir şeyi yapacak kadar bile enerjim yok.' },
    ],
  },
  {
    text: 'Uyku düzeni değişiklikleri',
    options: [
      { value: 0, label: 'Uykum her zamanki gibi.' },
      { value: 1, label: 'Her zamankinden biraz daha fazla ya da az uyuyorum.' },
      { value: 2, label: 'Her zamankinden çok daha fazla ya da az uyuyorum.' },
      { value: 3, label: 'Gün boyunca uyuyorum ya da hiç uyuyamıyorum.' },
    ],
  },
  {
    text: 'Sinirlilik',
    options: [
      { value: 0, label: 'Her zamankinden daha sinirli değilim.' },
      { value: 1, label: 'Her zamankinden biraz daha kolayca sinirlenirim.' },
      { value: 2, label: 'Her zamankinden çok daha fazla sinirleniyorum.' },
      { value: 3, label: 'Sürekli sinirleniyorum.' },
    ],
  },
  {
    text: 'İştah değişiklikleri',
    options: [
      { value: 0, label: 'İştahım her zamanki gibi.' },
      { value: 1, label: 'İştahım her zamankinden biraz daha fazla ya da az.' },
      { value: 2, label: 'İştahım her zamankinden çok daha fazla ya da az.' },
      { value: 3, label: 'Hiç iştahım yok ya da sürekli yemek yemek istiyorum.' },
    ],
  },
  {
    text: 'Konsantrasyon güçlüğü',
    options: [
      { value: 0, label: 'Her zamanki kadar iyi odaklanabiliyorum.' },
      { value: 1, label: 'Her zamanki kadar iyi odaklanamıyorum.' },
      { value: 2, label: 'Herhangi bir şeye uzun süre odaklanmak çok güç.' },
      { value: 3, label: 'Hiçbir şeye odaklanamıyorum.' },
    ],
  },
  {
    text: 'Yorgunluk',
    options: [
      { value: 0, label: 'Her zamankinden daha fazla yorgun değilim.' },
      { value: 1, label: 'Her zamankinden daha kolay yoruluyorum.' },
      { value: 2, label: 'Yaptığım pek çok şey için çok yorgunum.' },
      { value: 3, label: 'Herhangi bir şey yapamayacak kadar yorgunum.' },
    ],
  },
  {
    text: 'Cinsel ilgi',
    options: [
      { value: 0, label: 'Cinselliğe karşı ilgimde son zamanlarda belirgin bir değişiklik yok.' },
      { value: 1, label: 'Cinselliğe eskiye kıyasla daha az ilgi duyuyorum.' },
      { value: 2, label: 'Cinselliğe şu an çok az ilgi duyuyorum.' },
      { value: 3, label: 'Cinselliğe karşı ilgimi tamamen yitirdim.' },
    ],
  },
];

const BAE_QUESTIONS = [
  'Bedeninizde uyuşma veya karıncalanma hissettiniz mi?',
  'Aniden sıcak basmaları yaşadınız mı?',
  'Bacaklarınızda titreme ya da zayıflık hissettiniz mi?',
  'Gevşeyememe ya da rahatlayamama hissettiniz mi?',
  'En kötü şeylerin başınıza geleceğinden korktunuz mu?',
  'Baş dönmesi ya da sersemlik hissettiniz mi?',
  'Kalbinizin hızlı ya da sert çarptığını fark ettiniz mi?',
  'Dengenizi kaybediyor gibi hissettiniz mi?',
  'Dehşete kapıldınız mı ya da panik duygusu yaşadınız mı?',
  'Sinirli mi hissettiniz?',
  'Boğuluyormuş ya da nefes alamıyormuş gibi hissettiniz mi?',
  'Ellerinizin titrediğini fark ettiniz mi?',
  'Vücudunuzun sarsıldığını ya da sallandığını hissettiniz mi?',
  'Kontrolü kaybetmekten korktunuz mu?',
  'Nefes almakta güçlük çektiniz mi?',
  'Ölmekten korktunuz mu?',
  'Bir şeyden korkuya kapıldınız mı?',
  'Mide bulantısı ya da midede rahatsızlık hissettiniz mi?',
  'Bayılacakmış gibi hissettiniz mi?',
  'Yüzünüzün kızardığını ya da ateş bastığını hissettiniz mi?',
  'Sıcaktan değil ama terleme yaşadınız mı?',
];

const SCL_QUESTIONS = [
  // Somatizasyon (1-12)
  'Baş ağrısı yaşıyor musunuz?',
  'Sinirlilik ya da içinizin titremesi oluyor mu?',
  'Zihninizden atamadığınız, rahatsız edici düşünceler var mı?',
  'Baygınlık ya da baş dönmesi hissediyor musunuz?',
  'Cinsel istek veya zevkde azalma var mı?',
  'Başkalarının sizi eleştirdiği ya da kötü davrandığı hissine kapılıyor musunuz?',
  'Herhangi birinin düşüncelerinizi kontrol edebileceği fikri aklınıza geliyor mu?',
  'Sorunlarınızın çoğundan başkalarını sorumlu tutma eğiliminiz var mı?',
  'Olayları ya da anıları hatırlamakta güçlük çekiyor musunuz?',
  'Dikkatsizliğiniz ya da dağınıklığınız konusunda kaygı duyuyor musunuz?',
  'Kolayca kırılıyor ya da rahatsız mı oluyorsunuz?',
  'Göğüs ya da kalp bölgesinde ağrı hissediyor musunuz?',
  // Obsesif-kompülsif (13-22)
  'Açık alanlardan ya da sokakta yürümekten korkuyor musunuz?',
  'Enerjinizin düşük ya da yavaşlamış hissettiğiniz oluyor mu?',
  'Hayatınıza son vermeyi düşündünüz mü?',
  'Başkalarının duymadığı sesler duyuyor musunuz?',
  'Titreme yaşıyor musunuz?',
  'Çoğu insanın güvenemeyeceği birileri olduğuna inanıyor musunuz?',
  'İştahınız kötü mü?',
  'Kolayca ağlıyor musunuz?',
  // Kişilerarası duyarlılık (23-31)
  'Karşı cinsle utangaçlık ya da rahatsızlık hissediyor musunuz?',
  'Zehirlendiğiniz ya da içinizde bir şeylerin bozulduğu hissine kapılıyor musunuz?',
  'Aniden nedensiz korkuya kapıldığınız oluyor mu?',
  'Kendinizi kontrol edemeden öfke patlamaları yaşıyor musunuz?',
  'Yalnız dışarı çıkmaktan korkuyor musunuz?',
  'Olanlar için kendinizi suçluyor musunuz?',
  'Belden aşağıda ağrı hissediyor musunuz?',
  'Bir şeyleri halletmenizin önünde engeller hissediyor musunuz?',
  'Yalnızlık hissine kapılıyor musunuz?',
  // Depresyon (32-40)
  'Kendinizi karamsar hissediyor musunuz?',
  'Her şey hakkında aşırı endişeleniyor musunuz?',
  'Her şeye karşı ilgisizlik ya da isteksizlik hissediyor musunuz?',
  'Korku hissine kapılıyor musunuz?',
  'Duygularınızın kolayca incindiğini hissediyor musunuz?',
  'Başkalarının özel düşüncelerinizi ya da duygularınızı bildiğini hissediyor musunuz?',
  'Başkalarının sizin davranışlarınızı ya da düşüncelerinizi anlamadığı veya umursamadığı hissine kapılıyor musunuz?',
  'Sizi rahatsız eden birinin varlığında gerginleşiyor musunuz?',
  'Herkese açık yerlerde (alışveriş merkezi, sinema vb.) korku yaşıyor musunuz?',
  // Anksiyete (41-52)
  'Hiçbir şeyin önemli olmadığı hissine kapılıyor musunuz?',
  'Gergin ya da coşkulu hissediyor musunuz?',
  'Ağır bir hastalığınız olabileceğini düşünüyor musunuz?',
  'Başka bir kişiye ya da birden çok kişiye karşı cinsel ilginizin olmadığı oluyor mu?',
  'Başkalarının sizi gözetlediği ya da fısıldaştığı hissine kapılıyor musunuz?',
  'Uykuya dalmakta güçlük çekiyor musunuz?',
  'Yaptığınız işleri tekrar tekrar kontrol etme ihtiyacı duyuyor musunuz?',
  'Karar vermekte güçlük çekiyor musunuz?',
  'Otobüs, metro, tren gibi toplu taşıma araçlarında yolculuk etmek sizi korkutuyor mu?',
  'Nefes almakta güçlük çekiyor musunuz?',
  // Düşmanlık (53-58)
  'Sıcak ya da soğuk bölgelerde uyuşma, karıncalanma hissediyor musunuz?',
  'Sizi kötü hissettirecek şeyleri aklınızdan silmekte güçlük çekiyor musunuz?',
  'Zihinsel bir boşluk ya da bilinçli olarak hissetme güçlüğü yaşıyor musunuz?',
  'Beden ya da beyin belirtileri yüzünden işinizde sorun yaşıyor musunuz?',
  'Uykusuzluk çekiyor musunuz?',
  'Kendi davranışlarınız hakkında onay almak ihtiyacı duyuyor musunuz?',
  // Fobik anksiyete (59-65)
  'Kendinizle ilgili kötü düşünceler aklınıza geliyor mu?',
  'Başkalarının sizin hakkınızda ne düşündüğünden aşırı etkileniyor musunuz?',
  'Birlikte bulunmak zorunda olduğunuz kişilerle rahatsızlık duyuyor musunuz?',
  'Yalnızken kendinizi çok kötü ve mutsuz hissediyor musunuz?',
  'Sokağa ya da alışverişe çıkmak sizi tedirgin ediyor mu?',
  'İşlerin asla düzelmeyeceği duygusuna kapılıyor musunuz?',
  'Belirli kişilerle ilişkilerinizi sürdürmede güçlük yaşıyor musunuz?',
  // Paranoid düşünce (66-74)
  'Mide ağrısı çekiyor musunuz?',
  'Kendinizi başkalarından daha kötü ya da değersiz hissediyor musunuz?',
  'Başkalarıyla göz göze gelmekten rahatsızlık duyuyor musunuz?',
  'Gece uykuya daldıktan sonra sık sık uyanıyor musunuz?',
  'Bir şeyleri kırmak, ezmek ya da zarar vermek istediğiniz oluyor mu?',
  'Başkalarının bulunduğu yerlerde yemek yemekte güçlük çekiyor musunuz?',
  'Başkalarından farklı olduğunuz hissine kapılıyor musunuz?',
  'Bir düşünce sizin olmamasına karşın sürekli aklınıza geliyor mu?',
  'Başkalarının varlığında gerginlik yaşıyor musunuz?',
  // Psikotizm (75-90)
  'Alışveriş ya da sinemaya gitme gibi sıradan şeyleri tek başına yapamayacağınızdan korkuyor musunuz?',
  'Kolayca bunalıma giriyor musunuz?',
  'Kaslarınızda gerginlik veya sertlik hissediyor musunuz?',
  'Başkalarının sizi önemsemediği ya da umursamadığı hissine kapılıyor musunuz?',
  'Uyku kalitenizdeki bozukluktan şikâyetçi misiniz?',
  'Yaptığınız bazı şeyleri bitmeden bırakmak zorunda kaldığınız oluyor mu?',
  'Ölüm ya da can çekişme gibi konular sizi korkutuyor mu?',
  'Yemek sonrası bulantı ya da mide rahatsızlığı yaşıyor musunuz?',
  'Başkalarının size kötü davrandığı ya da size adil olmadığı hissine kapılıyor musunuz?',
  'Belirli hastalıklara yakalandığınızı düşünüyor musunuz?',
  'Başkalarıyla ilgili olumsuz duygular hissediyor musunuz?',
  'İçinizin sıkıştığını ya da boğulduğunuzu hissediyor musunuz?',
  'Bir şeye ait olmama ya da yabancı hissetme duygusu yaşıyor musunuz?',
  'Belirli düşünce, kelime ya da sayıların sizin için uğurlu ya da uğursuz olduğuna inanıyor musunuz?',
  'Titreme ya da sarsılma yaşıyor musunuz?',
  'Herkesin içinde bay ya da bayan tuvaletini kullanmakta güçlük çekiyor musunuz?',
];

async function main() {
  console.log('Seed başlıyor...');

  const adminHash = await bcrypt.hash('Admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@psikotakip.com' },
    update: {},
    create: {
      email: 'admin@psikotakip.com',
      passwordHash: adminHash,
      firstName: 'Sistem',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
      admin: {
        create: { clinicName: 'PsikoTakip Kliniği' },
      },
    },
  });

  const psychHash = await bcrypt.hash('Psikolog1234!', 12);
  await prisma.user.upsert({
    where: { email: 'psikolog@psikotakip.com' },
    update: {},
    create: {
      email: 'psikolog@psikotakip.com',
      passwordHash: psychHash,
      firstName: 'Ayşe',
      lastName: 'Kaya',
      role: Role.PSYCHOLOGIST,
      isActive: true,
      isVerified: true,
      psychologist: {
        create: {
          specialization: 'Bilişsel Davranışçı Terapi',
          biography: 'BDT uzmanı, 10 yıl deneyimli.',
          workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' },
          },
          sessionDurationMin: 50,
          isAcceptingClients: true,
          approvalStatus: PsychologistApprovalStatus.APPROVED,
          approvedAt: new Date(),
        },
      },
    },
  });

  const clientHash = await bcrypt.hash('Danisan1234!', 12);
  await prisma.user.upsert({
    where: { email: 'danisan@psikotakip.com' },
    update: {},
    create: {
      email: 'danisan@psikotakip.com',
      passwordHash: clientHash,
      firstName: 'Mehmet',
      lastName: 'Öztürk',
      role: Role.CLIENT,
      isActive: true,
      isVerified: true,
      client: { create: {} },
    },
  });

  // Beck Depresyon Envanteri II (BDE-II)
  const bdeQuestions = BDE_QUESTIONS.map((q, i) => ({ id: i + 1, text: q.text, options: q.options }));
  await prisma.psychologicalTest.upsert({
    where: { code: 'BDE-II' },
    update: { questions: bdeQuestions },
    create: {
      name: 'Beck Depresyon Envanteri II',
      code: 'BDE-II',
      description: '21 soruluk, depresyon şiddetini ölçen standart test. Son iki haftayı göz önünde bulundurarak yanıtlayın.',
      questions: bdeQuestions,
      scoringAlgorithm: { type: 'sum' },
      categoryThresholds: [
        { min: 0, max: 13, category: 'NORMAL' },
        { min: 14, max: 19, category: 'HAFIF' },
        { min: 20, max: 28, category: 'ORTA' },
        { min: 29, max: 63, category: 'AGIR' },
      ],
    },
  });

  // Beck Anksiyete Envanteri (BAE)
  await prisma.psychologicalTest.upsert({
    where: { code: 'BAE' },
    update: {
      questions: BAE_QUESTIONS.map((text, i) => ({
        id: i + 1,
        text,
        options: BAE_OPTIONS,
      })),
    },
    create: {
      name: 'Beck Anksiyete Envanteri',
      code: 'BAE',
      description: '21 soruluk, anksiyete şiddetini ölçen standart test. Geçen hafta boyunca sizi ne kadar rahatsız ettiğini belirtin.',
      questions: BAE_QUESTIONS.map((text, i) => ({
        id: i + 1,
        text,
        options: BAE_OPTIONS,
      })),
      scoringAlgorithm: { type: 'sum' },
      categoryThresholds: [
        { min: 0, max: 7, category: 'NORMAL' },
        { min: 8, max: 15, category: 'HAFIF' },
        { min: 16, max: 25, category: 'ORTA' },
        { min: 26, max: 63, category: 'AGIR' },
      ],
    },
  });

  // SCL-90
  await prisma.psychologicalTest.upsert({
    where: { code: 'SCL-90' },
    update: {
      questions: SCL_QUESTIONS.map((text, i) => ({
        id: i + 1,
        text,
        options: SCL_OPTIONS,
      })),
    },
    create: {
      name: 'SCL-90 Belirti Tarama Listesi',
      code: 'SCL-90',
      description: '90 soruluk, genel psikolojik belirtileri tarayan test. Son 7 günü göz önünde bulundurarak yanıtlayın.',
      questions: SCL_QUESTIONS.map((text, i) => ({
        id: i + 1,
        text,
        options: SCL_OPTIONS,
      })),
      scoringAlgorithm: { type: 'sum' },
      categoryThresholds: [
        { min: 0, max: 89, category: 'NORMAL' },
        { min: 90, max: 179, category: 'HAFIF' },
        { min: 180, max: 269, category: 'ORTA' },
        { min: 270, max: 360, category: 'AGIR' },
      ],
    },
  });

  console.log('Seed tamamlandı!');
  console.log('Admin: admin@psikotakip.com / Admin1234!');
  console.log('Psikolog: psikolog@psikotakip.com / Psikolog1234!');
  console.log('Danışan: danisan@psikotakip.com / Danisan1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
