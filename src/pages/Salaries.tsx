import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Employee } from "@/data/employees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Laptop,
  Mail,
  Phone,
} from "lucide-react";

type SortField = "lastName" | "department" | "position" | "hireDate" | "salary";
type SortOrder = "asc" | "desc";

const statusConfig = {
  active: { label: "Actif", variant: "active" as const, icon: UserCheck },
  inactive: { label: "Inactif", variant: "inactive" as const, icon: UserX },
  remote: { label: "Remote", variant: "remote" as const, icon: Laptop },
};

export default function Salaries() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("lastName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const baseUrl =
          import.meta.env.VITE_API_URL || "";

        const response = await fetch(`${baseUrl}/api/employees`);

        if (!response.ok) {
          throw new Error(`Erreur API (${response.status})`);
        }

        const data: Employee[] = await response.json();
        console.log("Données reçues de l'API:", data);
        console.log("Nombre d'employés:", data.length);
        setEmployees(data);
      } catch (err) {
        console.error("Erreur lors du chargement des employés :", err);
        setError("Impossible de charger les employés. Vérifiez l'API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))],
    [employees]
  );

  const filteredAndSortedEmployees = useMemo(() => {
    return employees
      .filter((employee) => {
        const matchesSearch =
          employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
          departmentFilter === "all" || employee.department === departmentFilter;

        const matchesStatus =
          statusFilter === "all" || employee.status === statusFilter;

        return matchesSearch && matchesDepartment && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "lastName":
            comparison = (a.lastName || "").localeCompare(b.lastName || "");
            break;
          case "department":
            comparison = (a.department || "").localeCompare(b.department || "");
            break;
          case "position":
            comparison = (a.position || "").localeCompare(b.position || "");
            break;
          case "hireDate":
            comparison = new Date(a.hireDate || 0).getTime() - new Date(b.hireDate || 0).getTime();
            break;
          case "salary":
            comparison = (a.salary || 0) - (b.salary || 0);
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [employees, searchTerm, departmentFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    remote: employees.filter((e) => e.status === "remote").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
  }), [employees]);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Gestion des <span className="gradient-text">Salariés</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Consultez et gérez l'ensemble des collaborateurs de DSPI-TECH
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-foreground" },
            { label: "Actifs", value: stats.active, icon: UserCheck, color: "text-success" },
            { label: "Remote", value: stats.remote, icon: Laptop, color: "text-primary" },
            { label: "Inactifs", value: stats.inactive, icon: UserX, color: "text-destructive" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {isLoading ? "-" : stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="glass rounded-xl p-6 mb-6 text-center text-muted-foreground">
            Chargement des employés...
          </div>
        )}

        {error && !isLoading && (
          <div className="glass rounded-xl p-6 mb-6 text-center text-destructive">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-secondary border-border">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("lastName")}
                  >
                    <div className="flex items-center">
                      Employé
                      <SortIcon field="lastName" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors hidden md:table-cell"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center">
                      Département
                      <SortIcon field="department" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors hidden lg:table-cell"
                    onClick={() => handleSort("position")}
                  >
                    <div className="flex items-center">
                      Poste
                      <SortIcon field="position" />
                    </div>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Statut</TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors hidden xl:table-cell"
                    onClick={() => handleSort("hireDate")}
                  >
                    <div className="flex items-center">
                      Date d'embauche
                      <SortIcon field="hireDate" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors text-right hidden lg:table-cell"
                    onClick={() => handleSort("salary")}
                  >
                    <div className="flex items-center justify-end">
                      Salaire
                      <SortIcon field="salary" />
                    </div>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEmployees.map((employee, index) => {
                  const statusInfo = statusConfig[employee.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow
                      key={employee.id}
                      className="border-border hover:bg-secondary/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {employee.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {employee.department}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="px-2 py-1 rounded-md bg-secondary text-sm">
                          {employee.department}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {employee.position}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {formatDate(employee.hireDate)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right font-medium">
                        {formatSalary(employee.salary)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={employee.email}>
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={employee.phone}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredAndSortedEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun employé trouvé</p>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Affichage de {filteredAndSortedEmployees.length} sur {employees.length} employés
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
