import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments, positions } from "@/data/employees";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Phone, Building2, Briefcase, Calendar, DollarSign, CheckCircle } from "lucide-react";

export default function Nouveau() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hireDate: "",
    salary: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      const id = `EMP${Date.now().toString().slice(-6)}`;

      const response = await fetch(`${baseUrl}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          status: "active",
          hireDate: formData.hireDate,
          salary: Number(formData.salary),
          avatar: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API (${response.status})`);
      }

      toast({
        title: "Employé ajouté avec succès !",
        description: `${formData.firstName} ${formData.lastName} a été ajouté à l'équipe.`,
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        hireDate: "",
        salary: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé :", error);
      toast({
        title: "Erreur lors de l'ajout",
        description: "Impossible d'ajouter l'employé. Vérifiez l'API.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      id: "firstName",
      label: "Prénom",
      type: "text",
      icon: User,
      placeholder: "Jean",
      required: true,
    },
    {
      id: "lastName",
      label: "Nom",
      type: "text",
      icon: User,
      placeholder: "Dupont",
      required: true,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      icon: Mail,
      placeholder: "jean.dupont@dspi-tech.com",
      required: true,
    },
    {
      id: "phone",
      label: "Téléphone",
      type: "tel",
      icon: Phone,
      placeholder: "+33 6 12 34 56 78",
      required: true,
    },
    {
      id: "hireDate",
      label: "Date d'embauche",
      type: "date",
      icon: Calendar,
      required: true,
    },
    {
      id: "salary",
      label: "Salaire annuel (€)",
      type: "number",
      icon: DollarSign,
      placeholder: "45000",
      required: true,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <UserPlus className="w-4 h-4" />
            Nouveau collaborateur
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Ajouter un <span className="gradient-text">Employé</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Remplissez le formulaire pour ajouter un nouveau membre à l'équipe DSPI-TECH
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.slice(0, 4).map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.id as keyof typeof formData]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          required={field.required}
                          className="pl-10 bg-secondary border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Professional Information */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Informations professionnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Département <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">
                    Poste <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleChange("position", value)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formFields.slice(4).map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.id as keyof typeof formData]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          required={field.required}
                          className="pl-10 bg-secondary border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" size="lg">
                Annuler
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Ajouter l'employé
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
