const http = require('http');

const BASE_URL = 'http://localhost:5001/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting Full System & Workflow Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health check returns status ok');

  // 2. Authentication: Student Login
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@nst.edu', password: 'password123' },
  });
  assert(studentLogin.status === 200 && studentLogin.data.token, 'Student login returns valid JWT token');
  const studentToken = studentLogin.data.token;

  // 3. Authentication: Reviewer Login
  const revLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'reviewer@nst.edu', password: 'password123' },
  });
  assert(revLogin.status === 200 && revLogin.data.user?.role === 'REVIEWER', 'Reviewer login returns user with role REVIEWER');
  const revToken = revLogin.data.token;

  // 4. Subjects & Topics
  const subjects = await request('/subjects');
  assert(Array.isArray(subjects.data) && subjects.data.length >= 6, 'GET /api/subjects returns at least 6 academic subjects');

  const topics = await request('/topics/1');
  assert(Array.isArray(topics.data) && topics.data.length >= 1, 'GET /api/topics/1 returns syllabus topics for Mathematics');

  // 5. Submit Resource
  const uniqueUrl = `https://youtube.com/watch?v=unique_${Date.now()}`;
  const submitRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      title: 'Automated Test Calculus Guide',
      description: 'Useful limits and integrals guide',
      url: uniqueUrl,
      type: 'video',
      subjectId: 1,
      topicId: 1,
    },
  });
  assert(submitRes.status === 201 && submitRes.data.resource?.status === 'PENDING', 'Student resource submission creates a PENDING resource');
  const newSubmissionId = submitRes.data.resource?.submissionId;

  // 6. Duplicate Submission Prevention
  const dupRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      title: 'Duplicate Attempt',
      description: 'Duplicate description',
      url: uniqueUrl,
      type: 'video',
      subjectId: 1,
      topicId: 1,
    },
  });
  assert(dupRes.status === 400 && dupRes.data.error.includes('already been submitted'), 'Duplicate submission with same URL & topic is rejected with 400 error');

  // 7. Security: Student blocked from Reviewer Pending Endpoint
  const studentPending = await request('/submissions/pending', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(studentPending.status === 403, 'Student is denied access (403) from reviewer pending submissions');

  // 8. Reviewer Workflow: View Pending Submissions
  const revPending = await request('/submissions/pending', {
    headers: { Authorization: `Bearer ${revToken}` },
  });
  assert(Array.isArray(revPending.data) && revPending.data.some((s) => s.id === newSubmissionId), 'Reviewer can view pending submissions including new submission');

  // 9. Reviewer Workflow: Approve Submission
  const approveRes = await request(`/submissions/${newSubmissionId}/approve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${revToken}` },
    body: { note: 'Approved in automated stability verification.' },
  });
  assert(approveRes.status === 200 && approveRes.data.submission?.status === 'APPROVED', 'Reviewer approves submission and marks status APPROVED');

  // 10. Database Ratings: Rate 1-5 Stars and Upsert Duplicate Prevention
  const rateRes1 = await request('/resources/1/rate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { stars: 5 },
  });
  assert(rateRes1.status === 200 && rateRes1.data.rating === 5, 'Student rates resource 1 with 5 stars');

  const rateRes2 = await request('/resources/1/rate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { stars: 4 },
  });
  assert(rateRes2.status === 200 && rateRes2.data.rating === 4, 'Duplicate rating is updated in-place without duplicate record error');

  // 11. Invalid Rating Validation
  const invalidRate = await request('/resources/1/rate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { stars: 10 },
  });
  assert(invalidRate.status === 400, 'Invalid rating (10 stars) is rejected with 400 validation error');

  // 12. Feedback Submission
  const feedbackRes = await request('/resources/1/feedback', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { comment: 'Automated verification feedback comment.' },
  });
  assert(feedbackRes.status === 201 && feedbackRes.data.feedback?.comment, 'Student feedback is saved to database');

  // 13. Top 3 Videos per topic
  const topVideos = await request('/resources/top-videos?topicId=1');
  assert(Array.isArray(topVideos.data) && topVideos.data.length <= 3, 'Top videos endpoint returns up to 3 ranked video resources');

  console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
