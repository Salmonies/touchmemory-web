const CACHE_NAME = 'touchmemory-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/default-questions.js',
  '/Memory App/Extensor Pollicis Longus.jpeg',
  '/Memory App/External Abdominal Obliques.jpeg',
  '/Memory App/Fibularis Brevis.jpeg',
  '/Memory App/Fibularis Longus.jpeg',
  '/Memory App/Flexor Carpi Radialis.jpeg',
  '/Memory App/Flexor carpi ulnaris.jpeg',
  '/Memory App/Flexor Digitorum Profundus.jpeg',
  '/Memory App/Flexor Digitorum Superficialis.jpeg',
  '/Memory App/Flexor pollicis brevis.jpeg',
  '/Memory App/Flexor Pollicis Longus.jpeg',
  '/Memory App/Frontal.jpeg',
  '/Memory App/Gastrocnemius.jpeg',
  '/Memory App/Gluteus maximus.jpeg',
  '/Memory App/Gluteus medius.jpeg',
  '/Memory App/Gluteus minimus.jpeg',
  '/Memory App/Hamate.png',
  '/Memory App/Iliocostalis.jpeg',
  '/Memory App/Infraspinatus.jpeg',
  '/Memory App/Internal Abdominal Oblique.jpeg',
  '/Memory App/Latissimus Dorsi.jpeg',
  '/Memory App/Levator Scapulae.jpeg',
  '/Memory App/Longissimus.jpeg',
  '/Memory App/Lunate.jpeg',
  '/Memory App/Mandible.jpeg',
  '/Memory App/Maxilla.jpeg',
  '/Memory App/Medial Deltoid.jpg',
  '/Memory App/Occipital.png',
  '/Memory App/Palmaris Longus.jpeg',
  '/Memory App/Parietal.jpeg',
  '/Memory App/Pectoralis Major.jpeg',
  '/Memory App/Pectoralis Minor.jpeg',
  '/Memory App/Pisiform.jpeg',
  '/Memory App/Posterior Deltoid .jpeg',
  '/Memory App/Posterior Talofibular.jpg',
  '/Memory App/Pronator Teres.jpeg',
  '/Memory App/Quadratus Lumborum.jpeg',
  '/Memory App/Rectus Abdominis Oblique.jpeg',
  '/Memory App/Rectus Femoris.jpeg',
  '/Memory App/Rhomboid Minor.jpeg',
  '/Memory App/Rhomboids Major.jpeg',
  '/Memory App/Scaphoid.jpeg',
  '/Memory App/Semimembranosus.jpeg',
  '/Memory App/Semitendinosus.jpeg',
  '/Memory App/Soleus.jpeg',
  '/Memory App/Sphenoid.jpeg',
  '/Memory App/Spinalis.jpeg',
  '/Memory App/Sternocleidomastoid.jpeg',
  '/Memory App/Subscapularis.jpeg',
  '/Memory App/Supinator.jpeg',
  '/Memory App/Supraspinatus.jpeg',
  '/Memory App/Temporal.jpeg',
  '/Memory App/Teres Major.jpeg',
  '/Memory App/Teres Minor.jpeg',
  '/Memory App/Tibialis Anterior.jpeg',
  '/Memory App/Transversus Abdominis Obliique.jpeg',
  '/Memory App/Trapezium.jpeg',
  '/Memory App/Trapezius.jpeg',
  '/Memory App/Trapezoid.jpeg',
  '/Memory App/Triquetrum.jpeg',
  '/Memory App/Vastus Intermedius.jpeg',
  '/Memory App/Vastus Lateralis.jpeg',
  '/Memory App/Vastus Medialis Oblique.jpeg',
  '/Memory App/Zygomatic.jpeg',
  '/Memory App/Abductor Pollicis Longus.jpeg',
  '/Memory App/Anterior Deltoid.jpg',
  '/Memory App/Anterior Talofibular.jpg',
  '/Memory App/Biceps Brachii.jpeg',
  '/Memory App/Brachioradialis.jpeg',
  '/Memory App/Calcaneofibular.jpg',
  '/Memory App/Capitate.png',
  '/Memory App/Extensor Carpi Radialis Brevis.jpeg',
  '/Memory App/Extensor Carpi Radialis Longus.jpeg',
  '/Memory App/Extensor Carpi Ulnaris.jpeg',
  '/Memory App/Extensor Digiti Minimi.jpeg',
  '/Memory App/Extensor Digitorum.jpeg',
  '/Memory App/Extensor Indicis.jpeg',
  '/Memory App/Extensor Pollicis Brevis.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
