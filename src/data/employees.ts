export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'remote';
  hireDate: string;
  salary: number;
  avatar?: string;
}

export const employees: Employee[] = [
  {
    id: "EMP001",
    firstName: "Jean-Pierre",
    lastName: "Dubois",
    email: "jp.dubois@dspi-tech.com",
    phone: "+33 6 12 34 56 78",
    department: "Développement",
    position: "Lead Developer",
    status: "active",
    hireDate: "2021-03-15",
    salary: 65000,
  },
  {
    id: "EMP002",
    firstName: "Marie",
    lastName: "Laurent",
    email: "m.laurent@dspi-tech.com",
    phone: "+33 6 23 45 67 89",
    department: "Design",
    position: "UX Designer Senior",
    status: "active",
    hireDate: "2020-07-01",
    salary: 55000,
  },
  {
    id: "EMP003",
    firstName: "Thomas",
    lastName: "Martin",
    email: "t.martin@dspi-tech.com",
    phone: "+33 6 34 56 78 90",
    department: "Développement",
    position: "Full Stack Developer",
    status: "remote",
    hireDate: "2022-01-10",
    salary: 52000,
  },
  {
    id: "EMP004",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "s.bernard@dspi-tech.com",
    phone: "+33 6 45 67 89 01",
    department: "Marketing",
    position: "Marketing Manager",
    status: "active",
    hireDate: "2019-11-20",
    salary: 58000,
  },
  {
    id: "EMP005",
    firstName: "Alexandre",
    lastName: "Petit",
    email: "a.petit@dspi-tech.com",
    phone: "+33 6 56 78 90 12",
    department: "Infrastructure",
    position: "DevOps Engineer",
    status: "active",
    hireDate: "2021-08-05",
    salary: 60000,
  },
  {
    id: "EMP006",
    firstName: "Camille",
    lastName: "Rousseau",
    email: "c.rousseau@dspi-tech.com",
    phone: "+33 6 67 89 01 23",
    department: "RH",
    position: "DRH",
    status: "active",
    hireDate: "2018-04-12",
    salary: 70000,
  },
  {
    id: "EMP007",
    firstName: "Lucas",
    lastName: "Moreau",
    email: "l.moreau@dspi-tech.com",
    phone: "+33 6 78 90 12 34",
    department: "Développement",
    position: "Frontend Developer",
    status: "remote",
    hireDate: "2023-02-28",
    salary: 48000,
  },
  {
    id: "EMP008",
    firstName: "Emma",
    lastName: "Leroy",
    email: "e.leroy@dspi-tech.com",
    phone: "+33 6 89 01 23 45",
    department: "Commercial",
    position: "Account Executive",
    status: "active",
    hireDate: "2022-06-15",
    salary: 45000,
  },
  {
    id: "EMP009",
    firstName: "Hugo",
    lastName: "Garcia",
    email: "h.garcia@dspi-tech.com",
    phone: "+33 6 90 12 34 56",
    department: "Développement",
    position: "Backend Developer",
    status: "inactive",
    hireDate: "2020-09-01",
    salary: 50000,
  },
  {
    id: "EMP010",
    firstName: "Léa",
    lastName: "Martinez",
    email: "l.martinez@dspi-tech.com",
    phone: "+33 6 01 23 45 67",
    department: "Design",
    position: "Product Designer",
    status: "active",
    hireDate: "2023-01-09",
    salary: 47000,
  },
];

export const departments = [
  "Développement",
  "Design",
  "Marketing",
  "Infrastructure",
  "RH",
  "Commercial",
];

export const positions = [
  "Lead Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "UX Designer Senior",
  "Product Designer",
  "Marketing Manager",
  "DRH",
  "Account Executive",
];
