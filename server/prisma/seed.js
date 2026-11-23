const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NST Learning Hub database...');

  // Hash a default password for seed users
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Default Student and Reviewer Users
  const student = await prisma.user.upsert({
    where: { email: 'student@nst.edu' },
    update: { password: defaultPasswordHash },
    create: {
      name: 'Akash Kumar',
      email: 'student@nst.edu',
      password: defaultPasswordHash,
      studentId: 'NST2024001',
      role: 'STUDENT',
      department: 'Computer Science',
      year: '3rd Year',
    },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@nst.edu' },
    update: { password: defaultPasswordHash },
    create: {
      name: 'Dr. Ramesh Sharma',
      email: 'reviewer@nst.edu',
      password: defaultPasswordHash,
      studentId: 'NST-FAC-01',
      role: 'REVIEWER',
      department: 'Computer Science',
    },
  });

  // 2. Create Subjects
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH', icon: 'calculator-outline', color: '#1565C0' },
    { name: 'Physics', code: 'PHY', icon: 'planet-outline', color: '#6A1B9A' },
    { name: 'Computer Science', code: 'CS', icon: 'laptop-outline', color: '#00695C' },
    { name: 'Chemistry', code: 'CHEM', icon: 'flask-outline', color: '#E65100' },
    { name: 'English', code: 'ENG', icon: 'book-outline', color: '#1B5E20' },
    { name: 'Electronics', code: 'ELEC', icon: 'hardware-chip-outline', color: '#B71C1C' },
  ];

  const createdSubjects = {};
  for (const s of subjectsData) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: { icon: s.icon, color: s.color },
      create: s,
    });
    createdSubjects[s.code] = sub;
  }

  // 3. Create Topics
  const topicsData = [
    { subjectCode: 'MATH', name: 'Calculus' },
    { subjectCode: 'MATH', name: 'Linear Algebra' },
    { subjectCode: 'MATH', name: 'Probability & Statistics' },
    { subjectCode: 'PHY', name: 'Mechanics' },
    { subjectCode: 'PHY', name: 'Thermodynamics' },
    { subjectCode: 'PHY', name: 'Electromagnetism' },
    { subjectCode: 'CS', name: 'Data Structures' },
    { subjectCode: 'CS', name: 'Algorithms' },
    { subjectCode: 'CS', name: 'Operating Systems' },
    { subjectCode: 'CS', name: 'Computer Networks' },
    { subjectCode: 'CHEM', name: 'Organic Chemistry' },
    { subjectCode: 'CHEM', name: 'Physical Chemistry' },
    { subjectCode: 'ENG', name: 'Technical Writing' },
    { subjectCode: 'ELEC', name: 'Digital Electronics' },
    { subjectCode: 'ELEC', name: 'Analog Circuits' },
  ];

  const createdTopics = {};
  for (const t of topicsData) {
    const subject = createdSubjects[t.subjectCode];
    const topic = await prisma.topic.upsert({
      where: {
        subjectId_name: {
          subjectId: subject.id,
          name: t.name,
        },
      },
      update: {},
      create: {
        name: t.name,
        subjectId: subject.id,
      },
    });
    createdTopics[`${t.subjectCode}_${t.name}`] = topic;
  }

  // 4. Create Initial Approved Resources
  const resourcesData = [
    {
      title: 'Introduction to Calculus — Khan Academy',
      type: 'VIDEO',
      description: 'A comprehensive video series covering limits, derivatives, and integrals. Ideal for NST first-year students who need a solid foundation in calculus.',
      url: 'https://www.youtube.com/playlist?list=PL19E79A0638C8D449',
      subjectCode: 'MATH',
      topicName: 'Calculus',
      rating: 5,
    },
    {
      title: 'Data Structures Crash Course — freeCodeCamp',
      type: 'VIDEO',
      description: 'A full 8-hour course on data structures including arrays, linked lists, stacks, queues, trees and graphs with practical examples.',
      url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
      subjectCode: 'CS',
      topicName: 'Data Structures',
      rating: 5,
    },
    {
      title: 'MIT OpenCourseWare — Linear Algebra',
      type: 'NOTES',
      description: 'Complete lecture notes from MIT 18.06 Linear Algebra by Prof. Gilbert Strang. Covers vector spaces, eigenvalues, and matrix operations.',
      url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/',
      subjectCode: 'MATH',
      topicName: 'Linear Algebra',
      rating: 5,
    },
    {
      title: 'GeeksforGeeks — Algorithms Tutorial',
      type: 'TUTORIAL',
      description: 'Well-organized tutorials on sorting, searching, dynamic programming, greedy algorithms and graph theory with code examples.',
      url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
      subjectCode: 'CS',
      topicName: 'Algorithms',
      rating: 4,
    },
    {
      title: "Physics for Scientists & Engineers — Mechanics Notes",
      type: 'NOTES',
      description: "Detailed notes covering Newton's laws, work-energy theorem, circular motion, and simple harmonic motion for NST Physics students.",
      url: 'https://www.physicsclassroom.com/class/newtlaws',
      subjectCode: 'PHY',
      topicName: 'Mechanics',
      rating: 4,
    },
    {
      title: 'Digital Electronics — NPTEL Lectures',
      type: 'VIDEO',
      description: 'NPTEL video lectures on digital logic, Boolean algebra, combinational and sequential circuits, flip-flops and counters.',
      url: 'https://nptel.ac.in/courses/117/105/117105080/',
      subjectCode: 'ELEC',
      topicName: 'Digital Electronics',
      rating: 5,
    },
  ];

  for (const r of resourcesData) {
    const subject = createdSubjects[r.subjectCode];
    const topic = createdTopics[`${r.subjectCode}_${r.topicName}`];

    // Check if resource already exists
    const existing = await prisma.resource.findFirst({
      where: { title: r.title },
    });

    if (!existing) {
      const createdResource = await prisma.resource.create({
        data: {
          title: r.title,
          description: r.description,
          url: r.url,
          type: r.type,
          status: 'APPROVED',
          subjectId: subject.id,
          topicId: topic.id,
          submission: {
            create: {
              userId: student.id,
              status: 'APPROVED',
            },
          },
          ratings: {
            create: {
              userId: student.id,
              stars: r.rating,
            },
          },
        },
      });
      console.log(`Created resource: ${createdResource.title}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
