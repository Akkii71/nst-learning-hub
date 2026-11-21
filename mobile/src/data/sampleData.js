// Sample NST subjects, topics, and learning resources
// This local data is used while the backend is not yet connected.

export const subjects = [
  { id: '1', name: 'Mathematics', code: 'MATH', icon: 'calculator-outline', color: '#1565C0' },
  { id: '2', name: 'Physics', code: 'PHY', icon: 'planet-outline', color: '#6A1B9A' },
  { id: '3', name: 'Computer Science', code: 'CS', icon: 'laptop-outline', color: '#00695C' },
  { id: '4', name: 'Chemistry', code: 'CHEM', icon: 'flask-outline', color: '#E65100' },
  { id: '5', name: 'English', code: 'ENG', icon: 'book-outline', color: '#1B5E20' },
  { id: '6', name: 'Electronics', code: 'ELEC', icon: 'hardware-chip-outline', color: '#B71C1C' },
];

export const topics = [
  { id: '1', subjectId: '1', name: 'Calculus' },
  { id: '2', subjectId: '1', name: 'Linear Algebra' },
  { id: '3', subjectId: '1', name: 'Probability & Statistics' },
  { id: '4', subjectId: '2', name: 'Mechanics' },
  { id: '5', subjectId: '2', name: 'Thermodynamics' },
  { id: '6', subjectId: '2', name: 'Electromagnetism' },
  { id: '7', subjectId: '3', name: 'Data Structures' },
  { id: '8', subjectId: '3', name: 'Algorithms' },
  { id: '9', subjectId: '3', name: 'Operating Systems' },
  { id: '10', subjectId: '3', name: 'Computer Networks' },
  { id: '11', subjectId: '4', name: 'Organic Chemistry' },
  { id: '12', subjectId: '4', name: 'Physical Chemistry' },
  { id: '13', subjectId: '5', name: 'Technical Writing' },
  { id: '14', subjectId: '6', name: 'Digital Electronics' },
  { id: '15', subjectId: '6', name: 'Analog Circuits' },
];

export const resources = [
  {
    id: '1',
    title: 'Introduction to Calculus — Khan Academy',
    type: 'video',
    description: 'A comprehensive video series covering limits, derivatives, and integrals. Ideal for NST first-year students who need a solid foundation in calculus.',
    subject: 'Mathematics',
    subjectId: '1',
    topic: 'Calculus',
    topicId: '1',
    url: 'https://www.youtube.com/playlist?list=PL19E79A0638C8D449',
    rating: 4.8,
    ratingCount: 124,
    submittedBy: 'Rahul Sharma',
    createdAt: '2026-10-15',
    status: 'approved',
  },
  {
    id: '2',
    title: 'Data Structures Crash Course — freeCodeCamp',
    type: 'video',
    description: 'A full 8-hour course on data structures including arrays, linked lists, stacks, queues, trees and graphs with practical examples.',
    subject: 'Computer Science',
    subjectId: '3',
    topic: 'Data Structures',
    topicId: '7',
    url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    rating: 4.7,
    ratingCount: 98,
    submittedBy: 'Priya Nair',
    createdAt: '2026-10-20',
    status: 'approved',
  },
  {
    id: '3',
    title: 'MIT OpenCourseWare — Linear Algebra',
    type: 'notes',
    description: 'Complete lecture notes from MIT 18.06 Linear Algebra by Prof. Gilbert Strang. Covers vector spaces, eigenvalues, and matrix operations.',
    subject: 'Mathematics',
    subjectId: '1',
    topic: 'Linear Algebra',
    topicId: '2',
    url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/',
    rating: 4.9,
    ratingCount: 215,
    submittedBy: 'Arjun Mehta',
    createdAt: '2026-10-25',
    status: 'approved',
  },
  {
    id: '4',
    title: 'GeeksforGeeks — Algorithms Tutorial',
    type: 'tutorial',
    description: 'Well-organized tutorials on sorting, searching, dynamic programming, greedy algorithms and graph theory with code examples.',
    subject: 'Computer Science',
    subjectId: '3',
    topic: 'Algorithms',
    topicId: '8',
    url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
    rating: 4.5,
    ratingCount: 76,
    submittedBy: 'Sneha Reddy',
    createdAt: '2026-11-01',
    status: 'approved',
  },
  {
    id: '5',
    title: "Physics for Scientists & Engineers — Mechanics Notes",
    type: 'notes',
    description: "Detailed notes covering Newton's laws, work-energy theorem, circular motion, and simple harmonic motion for NST Physics students.",
    subject: 'Physics',
    subjectId: '2',
    topic: 'Mechanics',
    topicId: '4',
    url: 'https://www.physicsclassroom.com/class/newtlaws',
    rating: 4.3,
    ratingCount: 54,
    submittedBy: 'Vikram Singh',
    createdAt: '2026-11-05',
    status: 'approved',
  },
  {
    id: '6',
    title: 'Digital Electronics — NPTEL Lectures',
    type: 'video',
    description: 'NPTEL video lectures on digital logic, Boolean algebra, combinational and sequential circuits, flip-flops and counters.',
    subject: 'Electronics',
    subjectId: '6',
    topic: 'Digital Electronics',
    topicId: '14',
    url: 'https://nptel.ac.in/courses/117/105/117105080/',
    rating: 4.6,
    ratingCount: 89,
    submittedBy: 'Anjali Kumar',
    createdAt: '2026-11-10',
    status: 'approved',
  },
];

// Return resources for a given subjectId
export function getResourcesBySubject(subjectId) {
  return resources.filter((r) => r.subjectId === subjectId);
}

// Return topics for a given subjectId
export function getTopicsBySubject(subjectId) {
  return topics.filter((t) => t.subjectId === subjectId);
}

// Return popular resources (highest rating)
export function getPopularResources(limit = 3) {
  return [...resources]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// Return recently added resources
export function getRecentResources(limit = 3) {
  return [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
