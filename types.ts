
export type UserRole = 'teacher' | 'parent' | 'admin' | 'headteacher' | 'accountant' | 'staff' | 'librarian';

// Grade type used across assessments and reports
export type Grade = 'EE' | 'ME' | 'AE' | 'NI' | '';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedClass?: string;
  childName?: string;
  studentId?: string; // Link to Student ID
  staffId?: string; // Official Staff ID
  position?: string;
  phone?: string;
}

// Added missing Message interface used for internal school communications
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  threadId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  ageGroup: string;
  publisher: string;
  publishedYear: string;
  shelfNumber: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  condition: 'New' | 'Good' | 'Damaged' | 'Lost';
  location?: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerId: string;
  borrowerName: string;
  borrowerRole: 'student' | 'staff' | 'teacher';
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  returnCondition?: 'Good' | 'Damaged' | 'Lost';
  status: 'borrowed' | 'returned' | 'overdue';
  fine: number;
  finePaid?: number;
}

export interface LeaveApplication {
  id: string;
  userId: string;
  userName: string;
  staffId: string;
  position: string;
  phone: string;
  type: 'Sick' | 'Annual' | 'Casual' | 'Maternity' | 'Paternity' | 'Compassionate' | 'Other';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  handoverPerson: string;
  handoverNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  headRemarks?: string;
  createdAt: string;
}

export interface Requisition {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Student {
  id: string; // Internal UUID
  officialId: string; // NISC/YEAR/SEQ
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: 'M' | 'F';
  nationality: string;
  age: string;
  className: string;
  house: string;
  bio?: string;
  profilePhoto?: string;
  isGraduated: boolean;
  isTransferred?: boolean;
  transferDate?: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  physicalAddress: string;
  // Medical Info
  medicalConcerns?: string;
  medicationDetails?: string;
  specialNeeds?: string;
  // Authorization
  authorizedPickups: { name: string; phone: string; relationship: string }[];
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  dueDate: string;
  items: { description: string; amount: number }[];
  discount: number;
  total: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Mobile Money' | 'Card' | 'Bank Transfer';
  reference?: string;
  category?: 'Fees' | 'Library Fine' | 'Other';
  isReversed?: boolean;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  category: 'Scholastic' | 'Utilities' | 'Salaries' | 'Maintenance' | 'Other';
  date: string;
  recordedBy: string;
  vendor?: string;
  receiptUrl?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  month: string;
  year: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
}

export interface BudgetRecord {
  id: string;
  category: string;
  allocated: number;
  year: string;
}

export interface BankTransaction {
  id: string;
  accountName: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  date: string;
  reference: string;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  category: 'Enrolment' | 'Financial' | 'Academic' | 'Administrative' | 'Security' | 'System';
}

export interface SystemSettings {
  branding: SystemBranding;
  security: SystemSecurity;
  activeSchoolId: string;
  schools: SchoolInfo[];
  timezone: string;
  currency: string;
}

export interface SystemBranding {
  schoolName: string;
  motto: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface SystemSecurity {
  sessionTimeout: number; // minutes
  requireTwoFactor: boolean;
  passwordComplexity: 'low' | 'medium' | 'high';
  maintenanceMode: boolean;
}

export interface SchoolInfo {
  id: string;
  name: string;
  campus: string;
  address: string;
  contact: string;
}

export interface Assessment {
  [categoryId: string]: {
    name: string;
    skills: { [skillName: string]: Grade };
    comment: string;
  };
}

export type ReportStatus = 'submitted' | 'under_review' | 'revision_requested' | 'approved';

export interface ProgressReport {
  id: string;
  studentId: string;
  learnerName: string;
  childAge: string;
  childClass: string;
  term: string;
  academicYear: string;
  parentEmail: string;
  daysPresent: string;
  daysAbsent: string;
  nextTermDate: string;
  assessments: Assessment;
  status: ReportStatus;
  headRemarks?: string;
  revisionNote?: string;
  createdAt: string;
  teacherId: string;
}
