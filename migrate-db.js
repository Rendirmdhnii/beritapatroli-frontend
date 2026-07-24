/**
 * Script Migrasi Data Artikel dari MySQL (WordPress) ke Supabase (PostgreSQL)
 * Portal Berita Patroli (.id)
 */

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Config Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Error: Harap konfigurasikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di file .env.local terlebih dahulu.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Config MySQL Lokal
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'beritapatroli_db',
};

const BATCH_SIZE = 500; // Ukuran batch per pengiriman data

// Helper untuk membersihkan dan membuat fallback slug
function formatSlug(postName, postTitle, id) {
  let slug = (postName || '').trim().toLowerCase();
  if (!slug) {
    slug = (postTitle || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  if (!slug) {
    slug = `artikel-${id}`;
  }
  return slug;
}

async function runMigration() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🚀 MEMULAI PROSES MIGRASI ARTIKEL KE SUPABASE');
  console.log('====================================================');

  let connection;

  try {
    // 1. Hubungkan ke Database MySQL
    console.log(`🔌 Menghubungkan ke MySQL Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}...`);
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Koneksi MySQL Berhasil!');

    // 2. Query mengambil artikel terpublikasi dari wp_posts
    console.log('🔍 Mengambil data artikel dari tabel wp_posts (post_status="publish" & post_type="post")...');
    const [rows] = await connection.execute(`
      SELECT ID, post_title, post_name, post_content, post_date 
      FROM wp_posts 
      WHERE post_status = 'publish' AND post_type = 'post'
      ORDER BY ID ASC
    `);

    const totalArticles = rows.length;
    console.log(`📋 Total artikel ditemukan: ${totalArticles.toLocaleString('id-ID')} baris.`);

    if (totalArticles === 0) {
      console.log('⚠️ Tidak ada artikel untuk dimigrasikan.');
      await connection.end();
      return;
    }

    // Map & siapkan penanganan slug duplikat
    const slugTracker = new Set();
    const preparedArticles = [];

    console.log('⚙️ Melakukan transformasi dan mapping data artikel...');

    for (let i = 0; i < totalArticles; i++) {
      const post = rows[i];
      let slug = formatSlug(post.post_name, post.post_title, post.ID);

      // Jika slug sudah pernah ada dalam batch, tambahkan suffix ID agar unik
      if (slugTracker.has(slug)) {
        slug = `${slug}-${post.ID}`;
      }
      slugTracker.add(slug);

      preparedArticles.push({
        title: post.post_title || 'Tanpa Judul',
        slug: slug,
        content: post.post_content || '',
        category: 'Berita Nasional', // Kategori default untuk migrasi
        featured_image_url: null,
        author: 'Redaksi Berita Patroli',
        published_at: post.post_date ? new Date(post.post_date).toISOString() : new Date().toISOString(),
        created_at: post.post_date ? new Date(post.post_date).toISOString() : new Date().toISOString(),
      });
    }

    // 3. Batching Insert ke Supabase
    const totalBatches = Math.ceil(totalArticles / BATCH_SIZE);
    console.log(`📦 Memulai pengiriman data dengan sistem Batching (${BATCH_SIZE} baris / batch | Total ${totalBatches} batch)...`);
    console.log('----------------------------------------------------');

    let totalSuccess = 0;
    let totalFailed = 0;

    for (let b = 0; b < totalBatches; b++) {
      const startIdx = b * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, totalArticles);
      const batchData = preparedArticles.slice(startIdx, endIdx);

      try {
        // Upsert batch data ke Supabase
        const { error } = await supabase
          .from('articles')
          .upsert(batchData, { onConflict: 'slug', ignoreDuplicates: true });

        if (error) {
          console.error(`❌ Batch ${b + 1}/${totalBatches} Gagal:`, error.message);
          totalFailed += batchData.length;
        } else {
          totalSuccess += batchData.length;
          const percentage = ((endIdx / totalArticles) * 100).toFixed(2);
          console.log(
            `[PROGRES] Batch ${b + 1}/${totalBatches} Selesai | Artikel ${startIdx + 1} - ${endIdx} (${percentage}%) | Sukses: ${totalSuccess}`
          );
        }
      } catch (batchErr) {
        console.error(`❌ Exception pada Batch ${b + 1}:`, batchErr.message);
        totalFailed += batchData.length;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('====================================================');
    console.log('🎉 MIGRASI SELESAI!');
    console.log(`⏱️ Waktu Eksekusi   : ${duration} detik`);
    console.log(`✅ Artikel Sukses  : ${totalSuccess.toLocaleString('id-ID')}`);
    console.log(`❌ Artikel Gagal   : ${totalFailed.toLocaleString('id-ID')}`);
    console.log('====================================================');

  } catch (err) {
    console.error('💥 Error Utama Migrasi:', err.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Koneksi MySQL ditutup.');
    }
  }
}

// Jalankan migrasi
runMigration();
