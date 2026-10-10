import { db, schema } from '../index';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

// Simple PBKDF2 password hashing helper for Node.js
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === key;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Parishes
  console.log('📍 Seeding Parishes...');
  const initialParishes = [
    { name: 'RCCG Alpha & Omega zone', slug: 'rccg-alpha-omega', code: 'ALP-01', zone: 'Zone 1' },
    { name: 'RCCG jesus sentuary parish', slug: 'rccg-jesus-sentuary', code: 'JES-02', zone: 'Zone 1' },
    { name: 'RCCG Victory Chapel', slug: 'rccg-victory-chapel', code: 'VIC-03', zone: 'Zone 2' },
    { name: 'RCCG Living Spring', slug: 'rccg-living-spring', code: 'LIV-04', zone: 'Zone 2' },
    { name: 'RCCG Throne of Grace', slug: 'rccg-throne-of-grace', code: 'TOG-05', zone: 'Zone 3' },
    { name: 'RCCG Jesus House', slug: 'rccg-jesus-house', code: 'JSH-06', zone: 'Zone 3' },
  ];

  for (const parish of initialParishes) {
    const existing = await db.query.parishes.findFirst({
      where: eq(schema.parishes.slug, parish.slug),
    });
    if (!existing) {
      await db.insert(schema.parishes).values(parish);
      console.log(`  + Created parish: ${parish.name}`);
    } else {
      console.log(`  ~ Parish exists: ${parish.name}`);
    }
  }

  // 2. Seed Default Admin
  console.log('👤 Seeding Default Admin...');
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPassword2026!';
  const adminFullName = process.env.DEFAULT_ADMIN_FULLNAME || 'Sunday School Administrator';
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@rccgalpha.org';

  const existingAdmin = await db.query.admins.findFirst({
    where: eq(schema.admins.username, adminUsername),
  });

  let adminId: string;
  if (!existingAdmin) {
    const [newAdmin] = await db.insert(schema.admins).values({
      username: adminUsername,
      email: adminEmail,
      fullName: adminFullName,
      passwordHash: hashPassword(adminPassword),
      status: 'active',
    }).returning({ id: schema.admins.id });
    adminId = newAdmin.id;
    console.log(`  + Created admin account: ${adminUsername} (ID: ${adminId}, Password: ${adminPassword})`);
  } else {
    adminId = existingAdmin.id;
    console.log(`  ~ Admin exists: ${adminUsername} (ID: ${adminId})`);
  }

  // 3. Seed Sample Questions
  console.log('📖 Seeding Sample Sunday School Questions...');
  const sampleQuestions = [
    {
      text: 'Who was chosen to replace Judas Iscariot among the twelve apostles?',
      type: 'multiple_choice',
      marks: 2,
      topic: 'Acts of the Apostles',
      explanation: 'Matthias was chosen by casting lots in Acts 1:26.',
      options: [
        { text: 'Barnabas', letter: 'A', isCorrect: false },
        { text: 'Matthias', letter: 'B', isCorrect: true },
        { text: 'Silas', letter: 'C', isCorrect: false },
        { text: 'Stephen', letter: 'D', isCorrect: false },
      ]
    },
    {
      text: 'The fruit of the Spirit is listed in Galatians chapter 5.',
      type: 'true_false',
      marks: 1,
      topic: 'Epistles',
      explanation: 'Galatians 5:22-23 lists love, joy, peace, longsuffering, etc.',
      options: [
        { text: 'True', letter: 'A', isCorrect: true },
        { text: 'False', letter: 'B', isCorrect: false },
      ]
    },
    {
      text: 'Which prophet was swallowed by a great fish when running from God to Tarshish?',
      type: 'multiple_choice',
      marks: 2,
      topic: 'Old Testament Prophets',
      explanation: 'Jonah was sent to Nineveh but fled toward Tarshish (Jonah 1:17).',
      options: [
        { text: 'Elijah', letter: 'A', isCorrect: false },
        { text: 'Jonah', letter: 'B', isCorrect: true },
        { text: 'Elisha', letter: 'C', isCorrect: false },
        { text: 'Amos', letter: 'D', isCorrect: false },
      ]
    },
    {
      text: 'What is the theme of the RCCG 2026 spiritual calendar or quarterly lesson?',
      type: 'short_written',
      marks: 5,
      topic: 'Church Doctrine & Theme',
      explanation: 'Manual evaluation by admin based on quarterly curriculum.',
      options: []
    }
  ];

  for (const q of sampleQuestions) {
    const [insertedQuestion] = await db.insert(schema.questions).values({
      questionText: q.text,
      questionType: q.type,
      marks: q.marks,
      topic: q.topic,
      explanation: q.explanation,
      status: 'active',
    }).returning({ id: schema.questions.id });

    if (q.options.length > 0) {
      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        await db.insert(schema.questionOptions).values({
          questionId: insertedQuestion.id,
          optionText: opt.text,
          optionLetter: opt.letter,
          isCorrect: opt.isCorrect,
          position: i,
        });
      }
    }
  }
  console.log(`  + Seeded ${sampleQuestions.length} sample questions.`);

  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
